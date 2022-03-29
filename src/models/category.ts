/**
 * @info schema for Category model
 */

import { Schema, model } from "mongoose";
import {generate} from "shortid";

export interface ICategory {
    _id: string;
    cid: string;
    name: string;

}

const schema = new Schema({
    cid: {
        type: String,
        default:generate,
        index: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
})

export default model<ICategory>("categories", schema);