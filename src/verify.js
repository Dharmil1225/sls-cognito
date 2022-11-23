import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  AdminCreateUserCommand,
  RevokeTokenCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoUserAttribute,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import chalk from "chalk";
import { User_Smart_School, User_Data_Design } from "./database/db";

export const verify = async (event) => {
  const { code, email } = JSON.parse(event.body);
  const cognito = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });

  const existingUser = await User_Smart_School.findOne({ where: { email } });
  if (!existingUser) {
    return "user not exist";
  }
  if (!code) {
    return "Please provide a code";
  }
  const data = new ConfirmSignUpCommand({
    ClientId: process.env.smart_school_client_id,
    ConfirmationCode: code,
    Username: existingUser.username,
  });

  await cognito.send(data);

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

  const userWithToken = await new Promise(async (res, rej) => {
    try {
      const user = await User_Smart_School.findOne({
        where: {
          email: email,
        },
      }).then((user) => {
        console.log(user);
        user.tokens.push(finalToken.accessToken, finalToken.refreshToken);
        User_Smart_School.update(
          {
            tokens: user.tokens,
          },
          {
            where: { email },
          }
        );
        return user;
      });
      res(user);
    } catch (error) {
      rej(error);
    }
  });
  console.log(chalk.bgCyan("userWithToken"), userWithToken);

  const finalData = await new Promise(async (res, rej) => {
    try {
      const existingUserInDataDesign = await User_Data_Design.findOne({
        where: { email: existingUser.email },
      });
      if (!existingUserInDataDesign) {
        await User_Data_Design.create({
          email: existingUser.email,
          username: existingUser.username,
          password: existingUser.password,
        });
        const command = new AdminCreateUserCommand({
          Username: existingUser.username,
          UserPoolId: process.env.data_design_userPool_id,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            {
              Name: "email",
              Value: existingUser.email,
            },
            {
              Name: "custom:Username",
              Value: existingUser.username,
            },
          ],
        });
        await cognito.send(command);

        const setPassword = new AdminSetUserPasswordCommand({
          Username: existingUser.username,
          Password: existingUser.password,
          Permanent: true,
          UserPoolId: process.env.data_design_userPool_id,
        });

        await cognito.send(setPassword);

        const poolData = {
          UserPoolId: process.env.data_design_userPool_id,
          ClientId: process.env.data_design_client_id,
        };
        const userPool = new CognitoUserPool(poolData);

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

        console.log("Password", existingUser.password);

        const authData = {
          Username: email,
          Password: existingUser.password,
        };

        const cognitoUser = new CognitoUser(userData);

        const authenticationDetails = new AuthenticationDetails(authData);

        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
            const token = {
              accessToken: result.getAccessToken().getJwtToken(),
              idToken: result.getIdToken().getJwtToken(),
              refreshToken: result.getRefreshToken().getToken(),
            };
            console.log(chalk.bgWhite("newtOKen"), token);
            res(token);
          },
          onFailure: function (err) {
            rej(err);
          },
        });

        try {
          await User_Data_Design.findOne({
            where: {
              email: email,
            },
          }).then((user) => {
            console.log(user);
            user.tokens.push(finalToken.accessToken, finalToken.refreshToken);
            User_Data_Design.update(
              {
                tokens: user.tokens,
              },
              {
                where: { email },
              }
            );
          });
        } catch (error) {
          console.log(error.message);
          rej(error);
        }
      } else {
        console.log(
          chalk.yellow(
            "-------------------------------------------RevokeTokenCommand-------------------------------"
          )
        );
        const command = new RevokeTokenCommand({
          ClientId: process.env.data_design_client_id,
          Token: userWithToken.tokens[1],
        });
        const newToken = await cognito.send(command);
        res(newToken);
      }
    } catch (error) {
      rej(error);
    }
  });
  console.log(chalk.bgWhite("finalData"), finalData);
  return {
    statusCode: 200,
    body: JSON.stringify({
      tokens: finalData,
    }),
  };
};
