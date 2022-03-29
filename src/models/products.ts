/**
 * @info schema for Product model
 */

import {model, Schema} from "mongoose";
import {generate} from "shortid";
import {ICategory} from "./category";
import {ISeller} from "./sellers";


export interface IProduct{
    _id:string,
    pid:string,
    pName:string,
    pDescription:string,
    aQuantity:number,
    sellPrice:number,
    costPrice:number,
    createdAt:Date,
    Seller : ISeller | string,
    Category : ICategory| string,
}

const schema=new Schema({
    pid:{
        type: String,
        default: generate,
        index: true,
        unique: true,
    },
    pName:{
        type: String,
        required:true
    },
    pDescription:{
        type:String,
        required:true,
    },
    aQuantity:{
        type:Number,
        required:true
    },
    sellPrice:{
        type:Number,
        required:true
    },
    costPrice:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    Seller:{
        type: Schema.Types.ObjectId,
        ref: 'sellers',
    },
    Category :{
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required:true
    }
})

export default model<IProduct>("products", schema)