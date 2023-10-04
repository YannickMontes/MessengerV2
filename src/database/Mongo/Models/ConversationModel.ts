import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "./MessageModel";

export interface IConversation extends Document {
	participants: string[];
	messages: IMessage[];
	title: string | null;
	lastUpdate: Date;
	seen: Record<string, mongoose.Schema.Types.ObjectId>;
}

const conversationSchema: Schema<IConversation> = new Schema<IConversation>(
	{
		participants: {
			type: [String],
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
			type: Object,
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
