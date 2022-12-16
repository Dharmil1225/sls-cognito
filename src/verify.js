import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { User_Smart_School } from "./database/db";

export const verify = async (event) => {
  const { code, email } = JSON.parse(event.body);
  const existingUser = await User_Smart_School.findOne({ where: { email } });
  if (!existingUser) {
    return "user not exist";
  }
  const cognito = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });
  const commandConfirmSignUp = new ConfirmSignUpCommand({
    ClientId: process.env.smart_school_client_id,
    ConfirmationCode: code,
    Username: existingUser.username,
  });
  await cognito
    .send(commandConfirmSignUp)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: commandConfirmSignUp,
    }),
  };
};
