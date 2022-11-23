import { db, User } from "./database/db";
import bcrypt from "bcryptjs";

export const createUser = async (event) => {
  await db.sync();
  // const jwtToken = event["headers"]["authorization"];
  // if (!jwtToken) {
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify({
  //       isAuthorized: false,
  //     }),
  //   };
  // }
  // const token = event["headers"]["authorization"].split(" ")[1];
  // if (!token) {
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify("Token is not defined"),
  //   };
  // }

  const { username, email, password } = JSON.parse(event.body);
  if (!event.body) {
    throw new Error("invalid input");
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "User already Exist" }),
    };
  }
  try {
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return {
      statusCode: 201,
      body: JSON.stringify(newUser),
    };
  } catch (error) {
    console.log(error.message);
    throw new Error("Internal server Error");
  }
};
