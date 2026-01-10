import { Account, AccountAttributes } from "../db/model/account";
import { AccountRepository } from "../repository/account";
import bcrypt from "bcryptjs";
import { hashString } from "../util/encryptionUtil";
import { AccountRequest, AccountResponse } from "../common/model/account";
import { NumberUtil } from "../util/numberUtil";
import { PhoneVerifyRepository } from "../repository/phoneVerify";
import jwt from "jsonwebtoken";
import { axiosRequest } from "../util/http";
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
            createdBy: result?.createdBy ?? ""
        };
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
        const account = await AccountRepository.withSchema(this.schema).createAccount({
            fullName: acc.fullName,
            displayName: acc.displayName ?? acc.fullName,
            countryCode: acc.countryCode ?? "+1",
            phoneNo: acc.phoneNo,
            email: acc.email.toLowerCase(),
            password: hashString(acc.password),
            allowAccess: true
        } as any);
        return this.transformResult(account);
    }
}
