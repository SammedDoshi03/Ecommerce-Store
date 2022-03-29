/**
 * @info schema for Admin model
 */

import { Schema, model } from "mongoose";

export interface IAdmin {
    _id: string;
    email: string;
    password: string;
}

const schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
});

export default model<IAdmin>("admins", schema);
