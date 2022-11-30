import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  AdminCreateUserCommand,
  RevokeTokenCommand,
  GetUserCommand,
  AdminGetUserCommand,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoUserAttribute,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import chalk from "chalk";
import { User_Smart_School } from "./database/db";

export const verify = async (event) => {
  const { code, email } = JSON.parse(event.body);
  const poolData = {
    UserPoolId: process.env.smart_school_userPool_id,
    ClientId: process.env.smart_school_client_id,
  };
  const userPool = new CognitoUserPool(poolData);
  const cognito = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });
  const existingUser = await User_Smart_School.findOne({ where: { email } });
  const attributeList = [];
  const dataEmail = {
    Name: "email",
    Value: existingUser.email,
  };
  const userData = {
    Username: existingUser.username,
    Pool: userPool,
  };
  const attributeEmail = new CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);
  const authData = {
    Username: existingUser.email,
    Password: existingUser.password,
  };
  const cognitoUser = new CognitoUser(userData);
  const authenticationDetails = new AuthenticationDetails(authData);

  console.log(chalk.bgMagenta("existingUser"), existingUser);
  if (!existingUser) {
    return "user not exist";
  }

  const commandConfirmSignUp = new ConfirmSignUpCommand({
    ClientId: process.env.smart_school_client_id,
    ConfirmationCode: code,
    Username: existingUser.username,
  });
  await cognito
    .send(commandConfirmSignUp)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });

  const User_Tokens = await new Promise(async (res, rej) => {
    try {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          const token = {
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          };
          res(token);
        },
        onFailure: async function (err) {
          console.log(err);
          rej(err);
        },
      });
    } catch (error) {
      rej(error);
      return error;
    }
  });
  await User_Smart_School.findOne({
    where: {
      email: email,
    },
  }).then(async (user) => {
    console.log(user);
    user.tokens.push(User_Tokens.accessToken, User_Tokens.refreshToken);
    await User_Smart_School.update(
      {
        tokens: user.tokens,
      },
      {
        where: { email },
      }
    );
    return user;
  });
  const getUser = await new Promise(async (res, rej) => {
    try {
      const getUserFromCognito = new GetUserCommand({
        AccessToken: User_Tokens.accessToken,
      });
      const result = await cognito.send(getUserFromCognito);
      res(result);
    } catch (error) {
      rej(error);
    }
  });

  const checkUserInCognito = await new Promise(async (res, rej) => {
    const poolData = {
      UserPoolId: process.env.smart_school_userPool_id,
      ClientId: process.env.smart_school_client_id,
    };
    const userPool = new CognitoUserPool(poolData);
    const attributeList = [];
    const dataEmail = {
      Name: "email",
      Value: existingUser.email,
    };
    const userData = {
      Username: existingUser.username,
      Pool: userPool,
    };
    const attributeEmail = new CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);
    const authData = {
      Username: existingUser.email,
      Password: existingUser.password,
    };
    const cognitoUser = new CognitoUser(userData);
    const authenticationDetails = new AuthenticationDetails(authData);
    try {
      const command = new AdminGetUserCommand({
        Username: getUser.Username,
        UserPoolId: process.env.data_design_userPool_id,
      });
      await cognito
        .send(command)
        .then(async (data) => {
          if (data) {
            const command = new RevokeTokenCommand({
              ClientId: process.env.data_design_client_id,
              Token: User_Tokens.refreshToken,
            });
            await cognito.send(command);
          }
          const token = await new Promise(async (res, rej) => {
            cognitoUser.authenticateUser(authenticationDetails, {
              onSuccess: function (result) {
                const token = {
                  accessToken: result.getAccessToken().getJwtToken(),
                  idToken: result.getIdToken().getJwtToken(),
                  refreshToken: result.getRefreshToken().getToken(),
                };
                console.log(chalk.bgMagenta("token for existing user"), token);
                res(token);
              },
              onFailure: async function (err) {
                rej(err);
              },
            });
          });
          console.log(token);
          res(token);
        })
        .catch(async (err) => {
          if (err instanceof UserNotFoundException) {
            const command = new AdminCreateUserCommand({
              Username: getUser.Username,
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

            const token = await new Promise(async (res, rej) => {
              cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                  const token = {
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.getIdToken().getJwtToken(),
                    refreshToken: result.getRefreshToken().getToken(),
                  };
                  console.log(chalk.bgYellow("token for new user"), token);
                  res(token);
                },
                onFailure: async function (err) {
                  rej(err);
                },
              });
            });
            console.log(token);
            res(token);
          }
        });
    } catch (error) {
      rej(error);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: checkUserInCognito,
    }),
  };
};
