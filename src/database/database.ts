import type { ConversationController } from "./Mongo/Controllers/conversationController.js";
import type { MessageController } from "./Mongo/Controllers/messageController.js";
import type { UserController } from "./Mongo/Controllers/userController.js";
import { conversationController } from "./Mongo/Controllers/conversationController.js";
import { messageController } from "./Mongo/Controllers/messageController.js";
import { userController } from "./Mongo/Controllers/userController.js";
import mongoose from "mongoose";
import config from "../config.js";
import { MongooseID } from "../types.js";

interface ActiveUsers {
	[socketId: string]: MongooseID;
}

class Database {
	conversationController: ConversationController;
	messageController: MessageController;
	userController: UserController;
	activeUsers: ActiveUsers = {};

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
