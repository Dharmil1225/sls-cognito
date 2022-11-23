import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import chalk from "chalk";
import { User_Smart_School, User_Data_Design } from "./database/db";

export const getUserData = async (event) => {
  const { email, username, password } = JSON.parse(event.body);

  const client = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });

  const userFromSmartSchool = await User_Smart_School.findOne({
    where: { email },
  });

  console.log(chalk.bgCyan("existingUser"), userFromSmartSchool);

  const command = new GetUserCommand({
    AccessToken: userFromSmartSchool.tokens[0],
  });

  const getCognitoData = await client.send(command);
  console.log(chalk.bgGreen("getCognitoData"), getCognitoData);

  await new Promise(async (res, rej) => {
    try {
      const userFromDataDesign = await User_Data_Design.findOne({
        where: { email: userFromSmartSchool.email },
      });
      if (!userFromDataDesign) {
        const data = await User_Data_Design.create({
          username,
          email,
          password,
        });
        console.log(data);
        res(data);
      }
    } catch (error) {
      rej(error);
    }
  });

  // const newToken = await new Promise((res, rej) => {
  //   try {
  //     const token = new RevokeTokenCommand({
  //       ClientId: process.env.data_design_client_id,
  //       Token: userFromSmartSchool.tokens[1],
  //     });
  //     res(token);
  //   } catch (error) {
  //     rej(error);
  //   }
  // });
  // console.log(chalk.bgMagenta("newToken"), newToken);
  // const cognitoData = await new Promise(async (res, rej) => {

  // });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: "ok",
      // data: {
      //   email: cognitoData.UserAttributes[1].Value,
      //   isVerified: cognitoData.UserAttributes[2].Value,
      //   Username: cognitoData.Username,
      // },
    }),
  };
};
