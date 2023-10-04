import type { ConversationController } from "./Mongo/Controllers/conversationController";
import type { MessageController } from "./Mongo/Controllers/messageController";
import type { UserController } from "./Mongo/Controllers/userController";
import { conversationController } from "./Mongo/Controllers/conversationController";
import { messageController } from "./Mongo/Controllers/messageController";
import { userController } from "./Mongo/Controllers/userController";
import mongoose from "mongoose";
import config from "../config";

class Database {
	conversationController: ConversationController;
	messageController: MessageController;
	userController: UserController;

	constructor(
		conversationController: ConversationController,
		messageController: MessageController,
		userController: UserController
	) {
		this.conversationController = conversationController;
		this.messageController = messageController;
		this.userController = userController;

		mongoose
			.connect(config.DB_ADDRESS)
			.then(() => console.log("DB Connected"))
			.catch((error) => console.log("Error DB Connexion: ", error));
	}
}

let DBInstance = new Database(
	conversationController,
	messageController,
	userController
);

export default DBInstance;
export type { Database };
