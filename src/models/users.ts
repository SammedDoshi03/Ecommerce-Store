/**
 * @info schema for User model
 */


import {Schema, model} from "mongoose"
import {generate} from "shortid"

export interface IUser {
    _id: string;
    uid: string;
    name: string;
    email: string;
    password: string;
    balance: number;
}

const schema = new Schema({
    uid:{
        type:String,
        unique:true,
        default: generate,
        index: true
    },
    name:{
        type: String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        index:true,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    balance:{
        type:Number,
        default:0,
        min:0
    },
    Order : [{
        type: Schema.Types.ObjectId,
        ref: "orders"
    }]
})

export default model<IUser>("users",schema)
