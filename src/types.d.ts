import mongoose, { Schema } from "mongoose";

export type MongooseID = Schema.Types.ObjectId | string | null;