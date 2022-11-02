import {
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

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
  console.log(attributeList);

  userPool.signUp(
    username,
    password,
    attributeList,
    null,
    function (err, data) {
      if (err) {
        console.log(err.message || JSON.stringify(err));
        return;
      }
      const cognitoUser = data.user;
      console.log("Username is " + cognitoUser.getUsername());
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: "User Signed Up",
    }),
  };
};
