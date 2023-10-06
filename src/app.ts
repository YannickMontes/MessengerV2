import * as http from "http";
import express from "express";
import { Server } from "socket.io";
import { Database } from "./database/database.js";
import onSocketConnection from "./socket/socketController.js";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import checkToken from "./middleware/checkToken.js";

const app = express();

function makeApp(database: Database) {
	const server = http.createServer(app);
	app.locals.database = database;

	//   const userRoutes = require("./routes/userRoutes");
	//   console.log(userRoutes);
	//   const { conversationRoutes } = require("./routes/conversationRoutes");
	// console.log(router);
	app.use(express.json());
	app.use("/user", userRoutes.userRoutes);
	app.use("/conversation", checkToken, conversationRoutes.conversationRoutes);

	const io = new Server(server, { cors: { origin: "*" } });

	io.on("connection", (socket) => {
		onSocketConnection(io, socket, database);
	});

	return { app, server };
}

export { makeApp };
