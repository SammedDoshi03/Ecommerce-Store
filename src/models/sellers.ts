/**
 * @info schema for Seller model
 */


import { Schema, model } from "mongoose";
import { generate } from "shortid";
import {IOrder} from "./orders";
import {IProduct} from "./products";

export interface ISeller{
    _id: string;
    sid: string;
    name: string;
    email: string;
    password: string;
    Order: IOrder[] | string[],
    Product: IProduct[] | string[],
    noOfOrders: number;
    totalRevenue : number;
    netProfit:number,
}

const schema = new Schema({
    sid: {
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
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
    Order: [{
        type: Schema.Types.ObjectId,
        ref: "orders",
    }],
    Product: [{
        type: Schema.Types.ObjectId,
        ref: "products",
    }],
    noOfOrders: {
        type: Number,
        min: 0,
        default: 0,
    },
    totalRevenue: {
        type: Number,
        min: 0,
        default: 0,
    },
    netProfit: {
        type: Number,
        min: 0,
        default: 0,
    },
});

export default model<ISeller>("sellers", schema);