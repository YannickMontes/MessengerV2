import type { ConversationController } from "./Mongo/Controllers/conversationController";
import type { MessageController } from "./Mongo/Controllers/messageController";
import type { UserController } from "./Mongo/Controllers/userController";
import mongoose from "mongoose";
import config from "../config";

class Database {
	conversationController: ConversationController;
	messageController: MessageController;
	userController: UserController;
	fromTest: boolean;

	constructor(
		conversationController: ConversationController,
		messageController: MessageController,
		userController: UserController,
		fromTest: boolean
	) {
		this.conversationController = conversationController;
		this.messageController = messageController;
		this.userController = userController;
		this.fromTest = fromTest;
	}

	async connect()
	{
		try
		{
			let connection = await mongoose.connect(this.fromTest ? config.DB_ADDRESS_TEST : config.DB_ADDRESS);
			console.log(`DB Connected to ${this.fromTest ? config.DB_ADDRESS_TEST : config.DB_ADDRESS}`);
		}
		catch(error)
		{
			console.log("Error DB Connexion: ", error);
		}
	}
}

export default Database;
export type { Database };
