import chalk from "chalk";
import { google } from "googleapis";
export const generateAuthUri = async () => {
  const client = new google.auth.OAuth2({
    clientId: process.env.google_client_id,
    clientSecret: process.env.google_client_secret,
    redirectUri: process.env.google_redirect_uri,
  });

  let scopes = [
    "https://www.googleapis.com/auth/cloud-platform.read-only",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ];

  const url = client.generateAuthUrl({
    access_type: "offline",
    client_id: process.env.google_client_id,
    prompt: "consent",
    scope: scopes,
  });
  console.log(chalk.bgGreen("URL"), url);
  return {
    statusCode: 200,
    body: JSON.stringify({
      URL: url,
    }),
  };
};
