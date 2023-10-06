import ConversationModel, { IConversation } from "../Models/ConversationModel.js";
import { IUser } from "../Models/UserModel.js";
import { MongooseID } from "../../../types";

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
		participants: MongooseID[]
	): Promise<ConversationResult> {
		try {
			let allTypeConv = await ConversationModel.find();
			let conversation = allTypeConv.find(
				(conv) =>
					conv.participants.length === participants.length &&
					participants.every((participant) =>
						//@ts-ignore
						conv.participants.includes(participant)
					)
			);
			conversation = await conversation?.populate("messages");
			conversation = await conversation?.populate("participants");
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async getAllConversationsForUser(
		userId: MongooseID
	): Promise<ConversationsResult> {
		try {
			let allConvs = await ConversationModel.find()
				.populate("messages")
				.populate("participants");
			let conversations = allConvs.filter((conv) =>
				//@ts-ignore
				conv.participants.includes(userId)
			);
			return { conversations };
		} catch (error) {
			return { error };
		}
	}

	async getConversationById(id: MongooseID): Promise<ConversationResult> {
		try {
			let conversation = await ConversationModel.findById(id)
				.populate("messages")
				.populate("participants");
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async createConversation(
		participants: MongooseID[],
		participantsNames: string[]
	): Promise<ConversationResult> {
		try {
			let title = "";
			for (let username of participantsNames) {
				let index = participantsNames.indexOf(username);
				if (index == participantsNames.length - 1) {
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
			});
			conversation = await conversation.populate("participants");
			conversation = await conversation.save();
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async addMessageToConversation(
		conversation: IConversation,
		messageId: MongooseID
	): Promise<ConversationResult> {
		try {
			//@ts-ignore
			conversation.messages.push(messageId);
			conversation.lastUpdate = new Date();
			conversation = await conversation.save();
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async setConversationSeenForUserAndMessage(
		user: IUser,
		conversationId: MongooseID,
		messageId: MongooseID
	): Promise<ConversationResult> {
		let { conversation, error } = await this.getConversationById(conversationId);
		if (error) {
			return { error };
		}
		if (!conversation) return { conversation: null };
		try {
			conversation.seen.set(user.username, messageId);
			conversation.markModified("seen");
			conversation = await conversation.save();
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async updateConversationTime(
		conversationId: MongooseID
	): Promise<ConversationResult> {
		try {
			let conversation = await ConversationModel.findByIdAndUpdate(conversationId,
				{
					lastUpdate: Date.now(),
				}
			)
			.populate("participants")
			.populate("messages");
			return { conversation };
		} catch (error) {
			return { error };
		}
	}

	async deleteConversation(
		conversationId: MongooseID
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
