/**
 * User Controller for user related operations
 */

import users, { IUser } from "../models/users";
import Bcrypt from "../services/bcrypt";
import orders, {IOrder} from "../models/orders";
import products, {IProduct} from "../models/products";
import mongoose from "mongoose";

export default class userController {
    /**
     * create a new user
     * @param body IUser
     * @returns user
     */
    static async create(body:IUser): Promise<IUser> {
        const hash = await Bcrypt.hashing(body.password);
        const data = {
            ...body,
            password: hash,
        };
        return users.create(data);
    }

    /**
     * Authenticate a user
     * @param email
     * @param password
     * @returns message
     */
    static async auth(email:string,password:string): Promise<IUser> {
        //fetch data from database
        const user=  await users.findOne({email}).lean()
        //check user is exists or not
        if (user)
        {
            //comparing the password with hash
            const res= await Bcrypt.comparing(password, user.password);
            //check correct or not
            if(res) return user;
            else throw new Error("wrong password")
        }
        else throw new Error("user not exists");

    }

    /**
     * Add money to user account
     * @param _id
     * @param balance
     */

    static async addBalance(_id, balance) {
        const user = await users.findById(_id).lean();
        if(user) {
            const newBalance = user.balance + balance;
            await users.findByIdAndUpdate(_id, {balance: newBalance});
            return newBalance;
        }
        else throw new Error("user not exists");
    }

    /**
     * Get User Profile
     * @param _id
     * @returns user
     */
    static async getUserProfile(_id) {
        const user = await users.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id)
                },
            },
            {
                $project:{
                    "password": 0,
                }
            },
        ]).exec();
        if(user) return user;
        else throw new Error("user not exists");
    }
}
