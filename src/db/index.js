import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import { conf } from "../conf.js";

export const connectDB = async () => {
    console.log(process.env.MONGODB_URL);
    console.log(DB_NAME);
  try {
    const connectionInstance = await mongoose.connect(
      `${conf.mongobdUrl}/${DB_NAME}`
    );

    console.log(
      "mongodb connected successfully running on port =>",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("error occured while connecting a database", error);
    process.exit(1);
  }
};
