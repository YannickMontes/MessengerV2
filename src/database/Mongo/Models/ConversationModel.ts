import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "./MessageModel";
import { MongooseID } from "../../../types";
import { IUser } from "./UserModel";

export interface IConversation extends Document {
	participants: MongooseID[] | IUser[];
	messages: IMessage[] | MongooseID[];
	title: string | null;
	lastUpdate: Date;
	seen: Map<MongooseID, MongooseID>;
}

const conversationSchema: Schema<IConversation> = new Schema<IConversation>(
{
		participants: {
			type: [{type: Schema.ObjectId, ref: 'User'}],
			required: true,
		},
		messages: {
			type: [{type: Schema.ObjectId, ref: 'Message'}],
			default: [],
		},
		title: {
			type: String,
			default: null,
		},
		lastUpdate: {
			type: Date,
			default: new Date(),
		},
		seen: {
			type: Map,
			of: Schema.ObjectId,
			default: {},
		},
	},
	{
		minimize: false,
	}
);

const ConversationModel = mongoose.model<IConversation>(
	"Conversation",
	conversationSchema
);

export default ConversationModel;
