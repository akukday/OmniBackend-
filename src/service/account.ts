import { AccountAttributes } from "../db/model/account";
import { AccountRepository } from "../repository/account";
import bcrypt from "bcryptjs";
import { hashString } from "../util/encryptionUtil";
import { AccountRequest, AccountResponse } from "../common/model/account";
import { NumberUtil } from "../util/numberUtil";
import { PhoneVerifyRepository } from "../repository/phoneVerify";
import jwt from "jsonwebtoken";
import { axiosRequest } from "../util/http";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
const jwkToPem = require('jwk-to-pem');

export class AccountService {
   constructor(private schema: string) {}

   static withSchema(schema: string) {
        return new AccountService(schema);
    }

    private transformResult(result: any): AccountResponse {
        result = result?.dataValues as AccountAttributes;
        return {
            id: result?.id ?? "",
            displayName: result?.displayName ?? "",
            fullName: result?.fullName ?? "",
            countryCode: result?.countryCode ?? "",
            phoneNo: result?.phoneNo ?? "",
            email: result?.email ?? "",
            allowAccess: result?.allowAccess ?? true,
            profilePicUrl: result?.profileUrl ?? "",
            createdBy: result?.createdBy ?? ""
        };
    }

    public async getAccountByUserId(userId: string): Promise<AccountResponse | null> {
        const account = await AccountRepository.withSchema(this.schema).findByUserId(userId);
        if(account) {
            return this.transformResult(account);
        }
        return null;
    }

    public async validateAndSendOtp(countryCode: string, phoneNo: string): Promise<String> {
        const account = await AccountRepository.withSchema(this.schema).findAccountByPhoneOrEmail(countryCode, phoneNo, "");
        if (!account) {
            throw new Error("Invalid phone number entered");
        }
        const randomOTP = NumberUtil.randomFixedInteger(5);
        //TODO: Need to integrate 3rd party service to Send otp

        await PhoneVerifyRepository.withSchema(this.schema!).recordPhoneVerify(`+${countryCode}${phoneNo}`, `${randomOTP}`)

        return "OTP sent successfully!"
    }

    public async isAuthenticated(email: string, password: string, countryCode: string, phone: string): Promise<AccountResponse> {
        const account = await AccountRepository.withSchema(this.schema).findAccountByPhoneOrEmail(countryCode, phone, email);
        const passwordMatched = await bcrypt.compare(password, account?.dataValues.password ?? "");
        if (passwordMatched) {
            return this.transformResult(account);
        }
        throw new Error("Invalid phone,email/ password combination!");
    }

    public async isAuthenticatedOTP(countryCode: string, phone: string, otp: string): Promise<AccountResponse> {
        const account = await AccountRepository.withSchema(this.schema).findAccountByPhoneOrEmail(countryCode, phone, "");
        const phoneVerify = await PhoneVerifyRepository.withSchema(this.schema!).phoneVerify(`+${countryCode}${phone}`);
        if(account && phoneVerify && phoneVerify.dataValues.otp == otp && phoneVerify.dataValues.expiresAt > new Date()) {
            return this.transformResult(account);
        }
        throw new Error("Invalid otp entered!");
    }

    public async isAuthenticatedEmail(email: string): Promise<AccountResponse | null> {
        const account = await AccountRepository.withSchema(this.schema).findAccountByPhoneOrEmail("", "", email);
        if(account) {
            return this.transformResult(account);
        }
        return null;
    }
    
    public async deleteAccount(accountId: string): Promise<number> {
        await AccountRepository.withSchema(this.schema).deleteAccount(accountId);
        return 1;
    }

    public async verifyAppleCreds(idToken: string) {
        const keysResponse = await axiosRequest<any>({
                    method: "GET",
                    baseURL: `https://appleid.apple.com`,
                    url: `/auth/keys`});
        const keys = keysResponse.data.keys;
        const tokenHeader = jwt.decode(idToken, { complete: true }).header;
        const key = keys.find(k => k.kid === tokenHeader.kid);
        const decodedToken = jwt.decode(idToken);
        if (!decodedToken) {
            throw new Error("Invalid ID token");
        }        
        if (!key) {
            throw new Error("Invalid token: key not found");
        }
        try {
            const publicKey = jwkToPem(key);
            const verified = jwt.verify(idToken, publicKey, {
                algorithms: ['RS256'],
                audience: decodedToken.aud, // Must match your app's client ID
                issuer: 'https://appleid.apple.com',
            });
            return verified;
        } catch(error) {
            throw new Error("Apple Login failed");
        }
    }

    public async registerUser(acc: AccountRequest): Promise<AccountResponse> {
        console.log(acc)
        const account = await AccountRepository.withSchema(this.schema).createAccount({
            fullName: acc.fullName,
            displayName: acc.displayName ?? acc.fullName,
            countryCode: acc.countryCode ?? "+1",
            phoneNo: acc.phoneNo,
            email: acc.email ? acc.email.toLowerCase() : null,
            password: hashString(acc.password),
            allowAccess: true
        } as any);
        return this.transformResult(account);
    }

    public async updateProfileNames(
      userId: string,
      payload: { fullName?: string; displayName?: string; profileImageId?: string }
    ): Promise<AccountResponse> {
      const existing = await AccountRepository.withSchema(this.schema).findByUserId(userId);
      if (!existing) {
        throw new Error("Account not found");
      }

      const bucketName = process.env["s3-profile-bucket"] || "event-planner-profile-pictures";
      const region = process.env.REGION || "ap-south-1";
      const profileUrl = payload.profileImageId
        ? `https://${bucketName}.s3.${region}.amazonaws.com/${payload.profileImageId}`
        : existing.dataValues.profileUrl;

      const updated = await AccountRepository.withSchema(this.schema).updateNames(
        userId,
        {
          fullName: payload.fullName ?? existing.dataValues.fullName,
          displayName: payload.displayName ?? existing.dataValues.displayName,
          profileUrl
        }
      );

      if (!updated) {
        throw new Error("Failed to update account");
      }

      return this.transformResult(updated);
    }

    public async getProfileImageUploadUrl(
      userId: string,
      payload: { contentType: string; fileName?: string }
    ): Promise<{ uploadUrl: string; profileImageId: string; expiresIn: number }> {
      const bucketName = process.env["s3-profile-bucket"] || "event-planner-profile-pictures";
      const region = process.env.REGION || "ap-south-1";
      if (!bucketName) {
        throw new Error("Profile image bucket is not configured");
      }

      const extMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      };
      const extension = extMap[payload.contentType] || "jpg";
      const safeFileName = (payload.fileName || uuidv4())
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 120);
      const profileImageId = `users/${userId}/profile/${Date.now()}-${safeFileName}.${extension}`;
      const expiresIn = 300;

      const s3 = new AWS.S3({ region });
      const uploadUrl = await s3.getSignedUrlPromise("putObject", {
        Bucket: bucketName,
        Key: profileImageId,
        ContentType: payload.contentType,
        Expires: expiresIn
      });

      return { uploadUrl, profileImageId, expiresIn };
    }
}
