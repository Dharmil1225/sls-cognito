import {
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import chalk from "chalk";

export const signUp = async (event) => {
  const { email, username, password } = JSON.parse(event.body);
  const poolData = {
    UserPoolId: process.env.user_pool_id,
    ClientId: process.env.app_client_id,
  };
  const userPool = new CognitoUserPool(poolData);
  const attributeList = [];
  const dataEmail = {
    Name: "email",
    Value: email,
  };

  const attributeEmail = new CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);
  const userData = await new Promise((res, rej) => {
    try {
      userPool.signUp(
        username,
        password,
        attributeList,
        null,
        function (err, data) {
          if (err) {
            console.log(err.message || JSON.stringify(err));
            return {
              statusCode: 400,
              body: JSON.stringify({
                error: err.message,
              }),
            };
          }
          const cognitoUser = data.user;
          console.log("Username is " + cognitoUser.getUsername());
          res(data);
        }
      );
    } catch (error) {
      rej(error);
    }
  });
  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: "User Signed Up",
    }),
  };
};
