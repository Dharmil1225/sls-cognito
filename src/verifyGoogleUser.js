import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import chalk from "chalk";
export const verifyGoogleUser = async (event) => {
  const { code, username } = JSON.parse(event.body);

  const cognito = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });

  const data = new ConfirmSignUpCommand({
    ClientId: process.env.app_client_id,
    ConfirmationCode: code,
    Username: username,
  });

  const response = await cognito.send(data);
  console.log(chalk.bgCyan("resposne"), response);
  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: response,
    }),
  };
};
