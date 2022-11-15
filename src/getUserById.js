import { User } from "./database/db";

export const getUserById = async (event) => {
  const { id } = event.pathParameters;
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Please provide an id" }),
    };
  }
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
  const getUser = await User.findOne({ where: { id } });
  try {
    if (!getUser) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `User with ${id} not found`,
        }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(getUser),
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }
};
