/**
 * @info starting the mongodb
 */
import mongoose from "mongoose";

export default class Mongo {

    static async connect(): Promise<boolean> {
        console.log("Connecting to mongodb");

        await mongoose.connect(process.env.MONGODB_URL, {
            user: process.env.MONGO_USER,
            pass: process.env.MONGO_PASS,
        });

        console.log("Connected to Mongodb Successfully");
        return true;
    }
}
