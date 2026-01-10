import { ModelStatic } from "sequelize";
import { PhoneVerify } from "../db/model/phoneVerify";
import { otpExpiryInMin } from "../common/constants/AppConstants";

export class PhoneVerifyRepository {
  private _phoneVerifyRepo: ModelStatic<PhoneVerify>;
  constructor(private schema: string) {
    this._phoneVerifyRepo = PhoneVerify.schema(this.schema);
  }

  static withSchema(schema: string) {
    return new PhoneVerifyRepository(schema);
  }

  public async recordPhoneVerify(phoneNo: string, otp: string): Promise<[PhoneVerify, boolean | null]> {
    return await this._phoneVerifyRepo.upsert({phoneNo: phoneNo, 
        otp: otp, 
        expiresAt: new Date(new Date().getTime() + otpExpiryInMin*60000)},
     {returning: true})
  }

  public async phoneVerify(phoneNo: string): Promise<PhoneVerify | null> {
    return await this._phoneVerifyRepo.findOne( {where: { phoneNo: phoneNo } } )
  }

}
