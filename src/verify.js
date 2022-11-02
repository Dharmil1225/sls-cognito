import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

export const verify = async (event) => {
  const { code, email, username } = JSON.parse(event.body);
  const poolData = {
    UserPoolId: process.env.user_pool_id,
    ClientId: process.env.app_client_id,
  };
  const userPool = new CognitoUserPool(poolData);
  const userData = {
    Username: username,
    Pool: userPool,
  };

  const attributeList = [];
  const dataEmail = {
    Name: "email",
    Value: email,
  };

  const attributeEmail = new CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  const user = new CognitoUser(userData);

  const result = await new Promise((res, rej) => {
    try {
      user.confirmRegistration(code, true, function (err, data) {
        if (err) {
          res(err.message);
          console.log(err.message || JSON.stringify(err));
        }
        res(data);
      });
    } catch (err) {
      rej(err);
    }
  });
  if (result !== "SUCCESS") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        msg: "Not Verified",
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: "Verified",
    }),
  };
};
