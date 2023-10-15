import mongoose, { Schema } from "mongoose";
import { Database } from "./database/database";
import { SocketController } from "./socket/socketController";
import { ConversationController } from "./database/Mongo/Controllers/conversationController";

export type MongooseID = Schema.Types.ObjectId | string | null;

declare global {
	namespace Express {
		interface Locals {
			database: Database;
			userId: MongooseID;
			sockerController: SocketController;
		}
	}
	var Database:Database
	var conv: ConversationController?
}