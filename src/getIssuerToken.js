import { google } from "googleapis";

export const getIssuerToken = async (event) => {
  const { code } = JSON.parse(event.body);
  const client = new google.auth.OAuth2({
    clientId: process.env.google_client_id,
    clientSecret: process.env.google_client_secret,
    redirectUri: process.env.google_redirect_uri,
  });

  const { tokens } = await client.getToken({ code });
  client.setCredentials(tokens);

  client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      client.setCredentials({
        refresh_token: tokens.refresh_token,
      });
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      tokens,
    }),
  };
};
