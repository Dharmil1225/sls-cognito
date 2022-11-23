import { Sequelize, DataTypes } from "sequelize";
import pg from "pg";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  RevokeTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";
export const getUserForDataDesign = async (event) => {
  const { email, username, password } = JSON.parse(event.body);
  const db = new Sequelize(
    process.env.postgres_dbname,
    process.env.postgres_username,
    process.env.postgres_password,
    {
      dialect: "postgres",
      host: process.env.postgres_data_design,
      dialectModule: pg,
    }
  );
  db.authenticate()
    .then(() => console.log("connected"))
    .catch((err) => console.log(err));

  const User = db.define(
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

  db.sync();

  const client = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      const newUser = await User.create({ email, username, password });
      console.log(newUser);
    }

    const userInCognito = new GetUserCommand({
      AccessToken: existingUser.tokens[0],
    });
  } catch (error) {}

  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: "ok",
    }),
  };
};
