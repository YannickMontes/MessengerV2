import { MessageModel, IMessage, EReaction } from "../Models/MessageModel";
import { MongooseID } from "../../../types";
import { MongooseError } from "mongoose";

export interface MessageResult {
	message?: IMessage | null;
	error?: any;
}

class MessageController {
	async createMessage(
		userId: MongooseID,
		content: string,
		convId: MongooseID,
		replyMsg: MongooseID
	): Promise<MessageResult> {
		try {
			let message = new MessageModel({
				conversationId: convId,
				from: userId,
				content,
				replyTo: replyMsg,
			});
			message = await message.save();
			return { message };
		} catch (error) {
			return { error };
		}
	}

	async editMessage(id: MongooseID, content: string): Promise<MessageResult> {
		try {
			let message = await MessageModel.findById(id);
			if (message != null) {
				message.content = content;
				message.edited = true;
				message = await message.save();
			}
			return { message };
		} catch (error) {
			if(error as MongooseError)
				return { error: (error as MongooseError).message };
			else
				return { error };
		}
	}

	async deleteMessage(id: MongooseID): Promise<MessageResult> {
		try {
			let message = await MessageModel.findById(id);
			if (message) {
				message.deleted = true;
				message.content = "";
				message = await message.save();
			}
			return { message };
		} catch (error) {
			return { error };
		}
	}

	async reactToMessage(
		userId: MongooseID,
		messageId: MongooseID,
		reaction: EReaction
	): Promise<MessageResult> {
		try {
			let message = await MessageModel.findById(messageId);
			if (message) {
				message.reactions.set(userId, reaction);
				message = await message.save();
			}
			return { message };
		} catch (error) {
			return { error };
		}
	}

	async getMessageById(messageId: MongooseID): Promise<MessageResult> {
		try {
			let message = await MessageModel.findById(messageId);
			return { message };
		} catch (error) {
			return { error };
		}
	}
}

const messageController = new MessageController();

export { messageController };
export type { MessageController };
