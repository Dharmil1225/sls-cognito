import { User } from "./database/db";

export const updateUser = async (event) => {
  const { username, email } = JSON.parse(event.body);
  const { id } = event.pathParameters;
  console.log(id);
  if (!event.body) {
    throw new Error("invalid input");
  }
  try {
    const existingUser = await User.findOne({ where: { id } });
    if (!existingUser) {
      return {
        statusCode: 400,
        message: `user with id ${id} not found`,
      };
    }
    await User.update(
      {
        username,
        email,
      },
      { where: { id } }
    );
    return {
      statusCode: 200,
      message: "user successfully updated",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
