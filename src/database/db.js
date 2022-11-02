import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";
export const db = new Sequelize(
  process.env.postgres_dbname,
  process.env.postgres_username,
  process.env.postgres_password,
  {
    dialect: "postgres",
    host: process.env.postgres_aws_endpoint,
    dialectModule: pg,
  }
);

db.authenticate()
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

export const User = db.define(
  "tbl_users",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "users",
  }
);

db.sync();
