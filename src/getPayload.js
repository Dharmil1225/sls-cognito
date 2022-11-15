import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { google } from "googleapis";
export const getPayload = async (event) => {
  const { idToken } = JSON.parse(event.body);

  let googlePayload;

  try {
    const client = new google.auth.OAuth2({
      clientId: process.env.google_client_id,
      clientSecret: process.env.google_client_secret,
      redirectUri: process.env.google_redirect_uri,
    });

    const userData = await client.verifyIdToken({ idToken });
    googlePayload = userData.getPayload();
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        msg: error.message,
      }),
    };
  }

  const data = await new Promise(async (res, rej) => {
    try {
      const params = {
        ClientId: process.env.app_client_id,
        Username: googlePayload.email.split("@")[0],
        Password: googlePayload.sub,
        UserAttributes: [
          {
            Name: "email",
            Value: googlePayload.email,
          },
          {
            Name: "custom:RegistrationMethod",
            Value: "google",
          },
        ],
        ClientMetadata: {
          EmailVerified: googlePayload.email_verified.toString(),
        },
      };
      const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.aws_region,
      });

      const signupCommand = new SignUpCommand(params);
      const response = await cognitoClient.send(signupCommand);
      res(response);
    } catch (error) {
      rej(error);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      payload: data["$metadata"],
    }),
  };
};
