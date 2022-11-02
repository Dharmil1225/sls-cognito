import { User, db } from "./database/db";
export const getUser = async (event) => {
  await db.sync();
  const jwtToken = event["headers"]["authorization"];
  if (!jwtToken) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        isAuthorized: false,
      }),
    };
  }
  const token = event["headers"]["authorization"].split(" ")[1];
  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify("Token is not defined"),
    };
  }
  try {
    const allusers = await User.findAll();
    return {
      statusCode: 200,
      body: JSON.stringify(allusers || []),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
