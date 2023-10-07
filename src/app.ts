import * as http from "http";
import express from "express";
import { Server } from "socket.io";
import { Database } from "./database/database.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import checkToken from "./middleware/checkToken.js";
import { SocketController } from "./socket/socketController.js";

const app = express();

function makeApp(database: Database) {
	const server = http.createServer(app);
	app.locals.database = database;

	app.use(express.json());
	app.use("/user", userRoutes.userRoutes);
	app.use("/conversations", checkToken,  conversationRoutes.conversationRoutes);
	app.use("/messages", checkToken, messageRoutes.messagesRoutes);

	const io = new Server(server, { cors: { origin: "*" } });

	let socketController = new SocketController(io, database);

	app.locals.sockerController = socketController;

	return { app, server };
}

export { makeApp };
