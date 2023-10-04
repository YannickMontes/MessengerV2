import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
	conversationId: mongoose.Schema.Types.ObjectId;
	from: string;
	content: string;
	postedAt: Date;
	replyTo: Record<string, any> | null;
	edited: boolean;
	deleted: boolean;
	reactions: Record<string, any>;
}

const MessageSchema: Schema<IMessage> = new Schema<IMessage>(
	{
		conversationId: {
			type: Schema.ObjectId,
			ref: "Conversation",
			required: true,
		},
		from: {
			type: String,
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
			type: Object,
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
			type: Object,
			default: {},
		},
	},
	{
		minimize: false,
	}
);

const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);

export { MessageModel, MessageSchema };
