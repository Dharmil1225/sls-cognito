import chalk from "chalk";
import { google } from "googleapis";
export const thirdPartyLogin = async (event) => {
  const client = new google.auth.OAuth2({
    clientId:
      "536056180063-oqdlo1vrrcgnuc2ha0p096ka58sme03c.apps.googleusercontent.com",
    clientSecret: "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",
    redirectUri: "http://localhost:3000/oauth2/idpresponse",
  });

  console.log(client);

  // const url = client.generateAuthUrl({
  //   access_type: "offline",
  //   prompt: "consent",
  //   scope: [
  //     "https://www.googleapis.com/auth/cloud-platform.read-only",
  //     "https://www.googleapis.com/auth/userinfo.email",
  //     "openid",
  //   ],
  // });

  // console.log(url);

  // const token = await new Promise(async (resolve, reject) => {
  //   try {
  //     const { tokens } = await client.getToken(
  //       "4/0AfgeXvuwPGmrwGnaiAI1A7S__BIwBnTb_dKSY2dW3W4u9xpWEUh64JFyysgvP_asbMC6tQ"
  //     );
  //     client.setCredentials(tokens);
  //     resolve(tokens);
  //   } catch (error) {
  //     console.log(error);
  //     reject(error);
  //   }
  // });

  // console.log(chalk.bgBlue("token"), token);

  await new Promise(async (res, rej) => {
    try {
      const ticket = await client.verifyIdToken({
        idToken:
          "eyJhbGciOiJSUzI1NiIsImtpZCI6IjcxM2ZkNjhjOTY2ZTI5MzgwOTgxZWRjMDE2NGEyZjZjMDZjNTcwMmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1MzYwNTYxODAwNjMtb3FkbG8xdnJyY2dudWMyaGEwcDA5NmthNThzbWUwM2MuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1MzYwNTYxODAwNjMtb3FkbG8xdnJyY2dudWMyaGEwcDA5NmthNThzbWUwM2MuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTI0ODc0NDA0MzIxNjMwNDI1OTAiLCJlbWFpbCI6InZha2FuaXZha2FuaWRoYXJtaWxAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJmbk5CUWRXd3RBYzVJeThHYzFjcFRnIiwiaWF0IjoxNjY4NDIyMDY1LCJleHAiOjE2Njg0MjU2NjV9.G3jypjFADBvDFosganoZfRNXFbIvXH12i9LDkFmGXOpCvzEmJtXU2aUjJca7mE8Lg0HFqz8rOHZAA1jHhchjwRoaeTB9iZo2ry4QyhMZPMwyB0TBrkM37WlaBmUPiia-UhEZzMqmeoaDn9HvISMgT3t1kW1OqkLWiQX79nhPDIVgpJeDHmoEm0_sTjkhktNA9XGC57I51-SG-9tmMsIlm_JhGlVLBYQKEtDHMV88UNpCW9-MA554pKDYjGavk2taUk_UV-jPUJSKNFT0KhXk434UdfCFtnm6n9zAf9jbpBc1IVc9h_86OUnV83hcafkeBPUCrkCVIp0OrVXFOi1FGg",
      });
      res(ticket);
      console.log(ticket.getPayload());
    } catch (error) {
      console.log(error);
      rej(error);
    }
  });

  console.log(chalk.bgMagenta("creds"), client.credentials);

  return {
    statusCode: 200,
    body: "Ok",
  };
};
