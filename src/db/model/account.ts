import { DataTypes, Model, Optional } from "sequelize";
import { dbService } from "../sequelize";

/**
 * 1️⃣ Attributes stored in DB
 */
export interface AccountAttributes {
  id: string;
  fullName?: string;
  displayName?: string;
  countryCode?: string;
  phoneNo?: string;
  email?: string;
  password?: string;
  allowAccess: boolean;
  profileUrl?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export type AccountCreationAttributes = Optional<AccountAttributes, "id" | "createdAt" | "updatedAt">;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: string;
  public fullName?: string;
  public displayName?: string;
  public countryCode?: string;
  public phoneNo?: string;
  public email?: string;
  public password?: string;
  public allowAccess!: boolean;
  public profileUrl?: string;
  public createdBy?: string;
  public createdAt?: Date;
  public updatedBy?: string;
  public updatedAt?: Date;
}

Account.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    fullName: {
      type: DataTypes.STRING,
      field: "full_name",
      allowNull: true
    },
    displayName: {
      type: DataTypes.STRING,
      field: "display_name",
      allowNull: true
    },
    countryCode: {
      type: DataTypes.STRING,
      field: "country_code",
      allowNull: true
    },
    phoneNo: {
      type: DataTypes.STRING,
      field: "phone_no",
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      field: "email",
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      field: "password",
      allowNull: true
    },
    allowAccess: {
      type: DataTypes.BOOLEAN,
      field: "allow_access",
      allowNull: false,
      defaultValue: true
    },
    profileUrl: {
      type: DataTypes.STRING,
      field: "profile_url",
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: DataTypes.NOW
    },
    createdBy: {
      type: DataTypes.UUID,
      field: "created_by",
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.UUID,
      field: "updated_by",
      allowNull: true
    }
  },
  {
    sequelize: dbService.dbModel,
    tableName: "account",
    timestamps: false
  }
);

Account.beforeUpdate((account) => {
  account.updatedAt = new Date();
});
