import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URL}${DB_NAME}`
        );
        console.log(
            `Mongodb connected : ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log(`Mongodb connection failed!!!`);
        process.exit(1);
    }
}

export default connectDB;
