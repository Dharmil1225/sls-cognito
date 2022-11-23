import {
  CognitoIdentityProviderClient,
  RevokeTokenCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const getTokenWithRefreshToken = async (event) => {
  const { refreshToken } = JSON.parse(event.body);

  const client = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });

  const command = new RevokeTokenCommand({
    ClientId: process.env.google_client_id,
    ClientSecret: process.env.google_client_secret,
    Token: refreshToken,
  });

  const res = await client.send(command);
  console.log(res);
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: res,
    }),
  };
};
