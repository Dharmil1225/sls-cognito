import { User } from "./database/db";

export const deleteUser = async (event) => {
  const { id } = event.pathParameters;
  if (!id) {
    return {
      statusCode: 400,
      message: "please provide an id",
    };
  }
  try {
    await User.destroy({ where: { id } });
    return {
      statusCode: 200,
      body: JSON.stringify(`user with ${id} deleted`),
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }
};
