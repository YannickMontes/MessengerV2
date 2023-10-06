import { MessageModel, IMessage, Reaction } from "../Models/MessageModel.js";
import { MongooseID } from "../../../types.js";

export interface MessageResult {
	message?: IMessage | null;
	error?: any;
}

class MessageController {
	async createMessage(
		userId: MongooseID,
		content: string,
		convId: string,
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
		reaction: Reaction
	): Promise<MessageResult> {
		try {
			let message = await MessageModel.findById(messageId);
			if (message) {
				message.reactions.set(userId, reaction);
				console.log(message);
				message.markModified("reactions");
				message = await message.save();
			} else {
				return { error: "Message not found" };
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

let messageController = new MessageController();

export { messageController };
export type { MessageController };
