import mongoose, { Schema, Document } from "mongoose";
import { MongooseID } from "../../../types";

export interface IMessage extends Document {
	conversationId: MongooseID;
	from: MongooseID;
	content: string;
	postedAt: Date;
	replyTo: MongooseID;
	edited: boolean;
	deleted: boolean;
	reactions: Map<MongooseID, EReaction>;
}

export enum EReaction
{
	HAPPY = "HAPPY",
	SAD = "SAD",
	THUMBSUP = "THUMBSUP",
	THUMBSDOWN = "THUMBSDOWN",
	LOVE = "LOVE"
}

const MessageSchema: Schema<IMessage> = new Schema<IMessage>(
	{
		conversationId: {
			type: Schema.ObjectId,
			ref: "Conversation",
			required: true,
		},
		from: {
			type: Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			default: "",
		},
		postedAt: {
			type: Date,
			default: new Date(),
		},
		replyTo: {
			type: Schema.ObjectId,
			ref: 'Message',
			default: null,
		},
		edited: {
			type: Boolean,
			default: false,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
		reactions: {
			type: Map,
			of: String,
			default: {},
		},
	},
	{
		minimize: false,
	}
);

const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);

export { MessageModel, MessageSchema };
