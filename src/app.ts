import * as http from "http";
import express from "express";
import { Server } from "socket.io";
import { Database } from "./database/database";
import userRoutes from "./routes/userRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import messageRoutes from "./routes/messageRoutes";
import checkToken from "./middleware/checkToken";
import { SocketController } from "./socket/socketController";
import cors from "cors";
import requestLogger from "./middleware/logger";


function makeApp(database: Database) 
{
	const app = express();

	app.use(cors({
		credentials: true,
		origin: "http://localhost:3000"
	}));

	const server = http.createServer(app);
	app.locals.database = database;

	app.use(express.json());
	app.use(requestLogger);
	app.use("/users", userRoutes.userRoutes);
	app.use("/conversations", checkToken,  conversationRoutes.conversationRoutes);
	app.use("/messages", checkToken, messageRoutes.messagesRoutes);

	const io = new Server(server, { cors: { origin: "*" } });

	let socketController = new SocketController(io, database);

	app.locals.sockerController = socketController;

	return { app, server };
}

export { makeApp };
