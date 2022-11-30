import {
  SignUpCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { User_Smart_School } from "./database/db";

export const signUp = async (event) => {
  const { email, username, password } = JSON.parse(event.body);
  const client = new CognitoIdentityProviderClient({
    region: process.env.aws_region,
  });

  const userData = await new Promise(async (res, rej) => {
    try {
      const params = {
        ClientId: process.env.smart_school_client_id,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
        ],
      };
      const command = new SignUpCommand(params);
      await client.send(command);

      const existingUser = await User_Smart_School.findOne({
        where: { email },
      });
      if (existingUser) {
        return existingUser;
      }
      const newUser = await User_Smart_School.create({
        email,
        username,
        password,
      });
      res(newUser);
    } catch (error) {
      rej(error);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: userData,
    }),
  };
};
