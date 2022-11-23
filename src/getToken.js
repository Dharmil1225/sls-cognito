import {
  CognitoUserAttribute,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import chalk from "chalk";
import { User_Smart_School } from "./database/db";

export const getToken = async (event) => {
  const { email, password, username } = JSON.parse(event.body);
  const poolData = {
    UserPoolId: process.env.smart_school_userPool_id,
    ClientId: process.env.smart_school_client_id,
  };
  const userPool = new CognitoUserPool(poolData);

  const attributeList = [];
  const dataEmail = {
    Name: "email",
    Value: email,
  };
  const userData = {
    Username: username,
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

  const finalToken = await new Promise(async (res, rej) => {
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
        onFailure: function (err) {
          rej(err);
        },
      });
    } catch (error) {
      rej(error);
    }
  });
  await User_Smart_School.findOne({
    where: {
      email: email,
    },
  }).then((user) => {
    console.log(user);
    user.tokens.push(finalToken.accessToken, finalToken.refreshToken);
    console.log(chalk.bgMagenta("user tokens"), user.tokens);
    User_Smart_School.update(
      {
        tokens: user.tokens,
      },
      {
        where: { email },
      }
    );
    console.log(chalk.bgBlue("user tokens"), user.tokens);
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      token: finalToken,
    }),
  };
};
