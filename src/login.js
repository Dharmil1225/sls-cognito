import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
  GetUserCommand,
  RevokeTokenCommand,
  AdminCreateUserCommand,
  UserNotFoundException,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoUserAttribute,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import chalk from "chalk";
import { User_Smart_School } from "./database/db";
export const login = async (event) => {
  const { email, password } = JSON.parse(event.body);
  const cognito = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });
  const getToken = async (userpoolid, clientid) => {
    const poolData = {
      UserPoolId: userpoolid,
      ClientId: clientid,
    };
    console.log(chalk.bgBlue("PoolData"), poolData);
    const userPool = new CognitoUserPool(poolData);
    const existingUser = await User_Smart_School.findOne({ where: { email } });
    const attributeList = [];
    const dataEmail = {
      Name: "email",
      Value: email,
    };
    const userData = {
      Username: existingUser.username,
      Pool: userPool,
    };
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);
    const authData = {
      Username: email,
      Password: password,
    };
    const cognitoUser = new CognitoUser(userData);
    const authenticationDetails = new AuthenticationDetails(authData);

    const User_Tokens = await new Promise(async (res, rej) => {
      try {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
            const token = {
              accessToken: result.getAccessToken().getJwtToken(),
              idToken: result.getIdToken().getJwtToken(),
              refreshToken: result.getRefreshToken().getToken(),
            };
            console.log(token);
            res(token);
          },
          onFailure: function (err) {
            console.log(err);
            rej(err);
          },
        });
      } catch (error) {
        rej(error);
        return error;
      }
    });
    return User_Tokens;
  };

  const tokens = await getToken(
    process.env.smart_school_userPool_id,
    process.env.smart_school_client_id
  );

  const SmartSchoolCognitoUser = await new Promise(async (res, rej) => {
    try {
      const getUserFromCognito = new GetUserCommand({
        AccessToken: tokens.accessToken,
      });
      const result = await cognito.send(getUserFromCognito);
      res(result);
    } catch (error) {
      rej(error);
    }
  });

  //* DataDesign Cognito Process

  const data = await new Promise(async (res, rej) => {
    try {
      const command = new AdminGetUserCommand({
        Username: SmartSchoolCognitoUser.Username,
        UserPoolId: process.env.data_design_userPool_id,
      });
      await cognito
        .send(command)
        .then(async (data) => {
          if (data) {
            const command = new RevokeTokenCommand({
              ClientId: process.env.data_design_client_id,
              Token: tokens.refreshToken,
            });
            await cognito.send(command);
            const token = await getToken(
              process.env.data_design_userPool_id,
              process.env.data_design_client_id
            );
            console.log(chalk.bgGreen("token for existing user user"), token);
            res(token);
          } else {
          }
        })
        .catch(async (err) => {
          if (err instanceof UserNotFoundException) {
            const command = new AdminCreateUserCommand({
              Username: SmartSchoolCognitoUser.Username,
              UserPoolId: process.env.data_design_userPool_id,
              MessageAction: "SUPPRESS",
              UserAttributes: [
                {
                  Name: "email",
                  Value: email,
                },
              ],
            });
            await cognito.send(command);
            const command2 = new AdminSetUserPasswordCommand({
              Username: SmartSchoolCognitoUser.Username,
              UserPoolId: process.env.data_design_userPool_id,
              Password: password,
              Permanent: true,
            });
            await cognito.send(command2);
            const tokens = await getToken(
              process.env.data_design_userPool_id,
              process.env.data_design_client_id
            );
            console.log(chalk.bgYellow("token for new user"), tokens);
            res(tokens);
          }
        });
    } catch (error) {
      rej(error);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: data,
    }),
  };
};
