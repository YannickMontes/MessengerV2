import { MessageModel, IMessage } from "../Models/MessageModel";

export interface MessageResult {
	message?: IMessage | null;
	error?: any;
}

class MessageController {
	async createMessage(
		username: string,
		content: string,
		convId: string,
		replyMsg: IMessage | null
	): Promise<MessageResult> {
		try {
			let message = new MessageModel({
				conversationId: convId,
				from: username,
				content,
				replyTo: replyMsg,
			});
			message = await message.save();
			return { message };
		} catch (error) {
			return { error };
		}
	}

	async editMessage(id: string, content: string): Promise<MessageResult> {
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

	async deleteMessage(id: string): Promise<MessageResult> {
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
		username: string,
		id: string,
		reaction: string
	): Promise<MessageResult> {
		try {
			let message = await MessageModel.findById(id);
			if (message) {
				message.reactions[username] = reaction;
				message.markModified("reactions");
				message = await message.save();
			}
			return { message };
		} catch (error) {
			return { error };
		}
	}

	async getMessageById(messageId: string) : Promise<MessageResult>
	{
		try{
			let message = await MessageModel.findById(messageId);
			return { message };
		}
		catch(error)
		{
			return { error };
		}
	}
}

let messageController = new MessageController();

export { messageController };
export type { MessageController };
