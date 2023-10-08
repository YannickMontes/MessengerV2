import mongoose, { Schema, Document } from "mongoose";
import { MongooseID } from "../../../types";

export interface IUser extends Document {
	_id: MongooseID;
	username: string;
	password: string;
	profilePicId: string;
	lastConnected: Date;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	profilePicId: {
		type: String,
		required: true,
	},
	lastConnected: {
		type: Date,
		default: new Date(),
		required: true,
	},
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
