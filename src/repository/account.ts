import { ModelStatic, Op, Sequelize, Transaction } from "sequelize";
import { Account } from "../db/model/account";
import { dbService } from "../db/sequelize";

export class AccountRepository {
    private _accountRepo: ModelStatic<Account>;
    constructor(private schema: string) {
      this._accountRepo = Account.schema(schema);
    }

    static withSchema(schema: string) {
      return new AccountRepository(schema);
    }

    private prepareAccountWhereClause(countryCode: string, phoneNo: string, email: string): any {
      if (phoneNo && email)
        return {[Op.or]: [{countryCode: countryCode || "+1", phoneNo: phoneNo}, {email: email.toLowerCase()}]}
      else if (phoneNo && !email)
        return {[Op.or]: [{countryCode: countryCode || "+1", phoneNo: phoneNo}]}
      else if (!phoneNo && email)
        return {[Op.or]: [{email: email.toLowerCase()}]}
  
      throw new Error('Phone no or Email is required');
    }

    public async findAccountByPhoneOrEmail(countryCode: string, phoneNo: string, email: string, t?: Transaction): Promise<Account | null> {
      const whereClause = this.prepareAccountWhereClause(countryCode, phoneNo, email);
      return this._accountRepo.findOne({where: whereClause, transaction: t});
    }

    public async createAccount(account: Account): Promise<Account> {
      return this._accountRepo.create({...account});
    }

    public async deleteAccount(accountId: string): Promise<number> {
      return this._accountRepo.destroy({where: {id: accountId}, cascade: true});
    }

}
