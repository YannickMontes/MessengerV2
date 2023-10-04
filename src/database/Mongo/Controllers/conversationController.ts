import ConversationModel, { IConversation } from "../Models/ConversationModel";
import mongoose from "mongoose";
import { IMessage } from "../Models/MessageModel";
import { MessageResult } from "./messageController";

interface ConversationResult {
	conversation?: IConversation | null;
	error?: any;
}

interface ConversationsResult {
	conversations?: IConversation[];
	error?: any;
}

class ConversationController {
	async getConversationWithParticipants(
		participants: string[]
	): Promise<ConversationResult> {
		try {
			let allTypeConv = await ConversationModel
				.find()
				.populate("messages");
			let conversation = allTypeConv.find(
				(conv) =>
					conv.participants.length === participants.length &&
					participants.every((participant) =>
						conv.participants.includes(participant)
					)
			);
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async getAllConversationsForUser(
		username: string
	): Promise<ConversationsResult> {
		try {
			let allConvs = await ConversationModel
				.find()
				.populate("messages");
			let conversations = allConvs.filter((conv) =>
				conv.participants.includes(username)
			);
			return { conversations };
		} catch (error) {
			return { error };
		}
	}

	async getConversationById(
		id: mongoose.Schema.Types.ObjectId | string
	): Promise<ConversationResult> {
		try {
			let conversation = await ConversationModel
				.findById(id)
				.populate("messages");
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async createConversation(
		participants: string[]
	): Promise<ConversationResult> {
		try {
			let seen: Record<string, number> = {};
			let title = "";
			for (let username of participants) {
				seen[username] = -1;
				let index = participants.indexOf(username);
				if (index == participants.length - 1) {
					title += " et ";
				} else if (index != 0) {
					title += ", ";
				}
				title += username;
			}
			let conversation = new ConversationModel({
				participants,
				title,
				lastUpdate: new Date(),
				seen,
			});
			conversation = await conversation.save();
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async addMessageToConversation(
		conversation: IConversation,
		messageId: string
	): Promise<ConversationResult> {
		try {
			//@ts-ignore
			conversation.messages.push(messageId);
			conversation.lastUpdate = new Date();
			conversation = await conversation.save();
			conversation = await conversation.populate("messages");
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async setConversationSeenForUserAndMessage(
		user: { username: string },
		conversationId: mongoose.Schema.Types.ObjectId,
		messageId: mongoose.Schema.Types.ObjectId
	): Promise<ConversationResult> {
		let { conversation, error } = await this.getConversationById(
			conversationId
		);
		if (error) {
			return { error };
		}
		if (!conversation) return { conversation: null };
		try {
			conversation.seen[user.username] = messageId;
			conversation.markModified("seen");
			conversation = await conversation.save();
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async updateConversationTime(
		conversationId: mongoose.Schema.Types.ObjectId
	): Promise<ConversationResult> {
		try {
			let conversation = await ConversationModel.findByIdAndUpdate(
				conversationId,
				{
					lastUpdate: Date.now(),
				}
			);
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async deleteConversation(
		conversationId: string
	): Promise<ConversationResult> {
		try {
			let conversation = await ConversationModel.findByIdAndDelete(
				conversationId
			);
			return { conversation };
		} catch (error) {
			return { error };
		}
	}
}

const conversationController = new ConversationController();

export { conversationController };
export type { ConversationController };
