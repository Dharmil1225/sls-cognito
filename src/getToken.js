import {
  CognitoUserAttribute,
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";

export const getToken = async (event) => {
  const { email, password, username } = JSON.parse(event.body);
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

  const finalToken = await new Promise((res, rej) => {
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
  if (!finalToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "token not found",
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      token: finalToken,
    }),
  };
};
