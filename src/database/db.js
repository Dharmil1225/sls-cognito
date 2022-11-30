import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";
export const smart_school_db = new Sequelize(
  process.env.postgres_dbname,
  process.env.postgres_username,
  process.env.postgres_password,
  {
    dialect: "postgres",
    host: process.env.postgres_smart_school,
    dialectModule: pg,
    port: 5432,
  }
);

smart_school_db
  .authenticate()
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

export const User_Smart_School = smart_school_db.define(
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
    tokens: {
      type: DataTypes.ARRAY(DataTypes.STRING(2048)),
      defaultValue: [],
    },
  },
  {
    tableName: "users",
  }
);

smart_school_db.sync();

export const data_design_db = new Sequelize(
  process.env.postgres_dbname,
  process.env.postgres_username,
  process.env.postgres_password,
  {
    dialect: "postgres",
    host: process.env.postgres_data_design,
    dialectModule: pg,
    port: 5432,
  }
);

data_design_db
  .authenticate()
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));

export const User_Data_Design = data_design_db.define(
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
    tokens: {
      type: DataTypes.ARRAY(DataTypes.STRING(2048)),
      defaultValue: [],
    },
  },
  {
    tableName: "users",
  }
);

data_design_db.sync();
