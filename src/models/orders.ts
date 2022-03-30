/**
 * @info schema for Order model
 */


import {Schema, model} from "mongoose"
import {generate} from "shortid"
import {IProduct} from "./products";
import {IUser} from "./users";
import {ISeller} from "./sellers";

export interface IOrder {
    _id: string;
    oid: string;
    User : IUser | String;
    Seller : ISeller | String;
    Product:  IProduct |  string;
    requiredQuantity: number;
    totalAmount: number;
    createdAt: Date;
}

const schema = new Schema({
    oid:{
        type:String,
        unique:true,
        default: generate,
        index: true
    },
    User:{
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    Seller:{
        type: Schema.Types.ObjectId,
        ref: "sellers"
    },
    Product:{
        type: Schema.Types.ObjectId,
        required:true
    },
    requiredQuantity:{
        type:Number,
        min:1,
        required:true
    },
    totalAmount:{
        type:Number,
        min:1,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

export default model<IOrder>("orders",schema)
