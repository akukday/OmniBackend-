import { Sequelize } from "sequelize";

class DbService {
  private _db: Sequelize;
  public get dbModel(): Sequelize {
    return this._db;
  }

  constructor() {
    this._db = new Sequelize({
      dialect: "postgres",
      dialectOptions: process.env.NODE_ENV?.trim() == 'prod' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false // Set to true if you want to reject unauthorized certificates
        }
      } : undefined,
      host: process.env.sql_host,
      database: process.env.sql_database,
      username: process.env.sql_username,
      password: process.env.sql_password,
      port: Number(process.env.sql_port),
      ssl: process.env.sql_tunnel === 'true',
      logging: process.env.sql_logging === 'true',
      benchmark: process.env.sql_benchmark === 'true',
      pool: {max: 5, min: 0, idle: 10000, acquire: 30000}
    });
    this._db.authenticate()
      .then(() => {
        console.log(`Connected with Database successfully`);
      })
      .catch((err) => {
        console.log(err)
        console.log(`Error Occured while connecting to DB`);
      });
  }
}

const dbService = new DbService();
export { dbService };
