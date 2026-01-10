import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";
import { AccountAttributes } from "./account";

interface PhoneVerifyAttributes {
  phoneNo: string,
  otp: string,
  expiresAt: Date
}

export type PhoneVerifyCreationAttributes = Optional<PhoneVerifyAttributes, "phoneNo">;

export class PhoneVerify extends Model<PhoneVerifyAttributes, PhoneVerifyCreationAttributes> implements PhoneVerifyAttributes {
    public phoneNo!: string;
    public otp!: string;
    public expiresAt!: Date;
}   

PhoneVerify.init(
    {
        phoneNo: {type: DataTypes.STRING, field: "phone_no", allowNull: false, unique: true, primaryKey: true},
        otp: {type: DataTypes.STRING, field: "otp", allowNull: false},
        expiresAt: {type: DataTypes.TIME, field: "expires_at", allowNull: false}
    },
    {
        sequelize: dbService.dbModel,
        tableName: "phone_verify",
        timestamps: false,
    }
);


