import { makeApp } from "./app";
import  Database from "./database/database";
import config from "./config";
import { conversationController } from "./database/Mongo/Controllers/conversationController";
import { messageController } from "./database/Mongo/Controllers/messageController";
import { userController } from "./database/Mongo/Controllers/userController";

let DBInstance = new Database(
	conversationController,
	messageController,
	userController,
	false
);

const { app, server } = makeApp(DBInstance);

server.listen(config.PORT, () => {
	console.log(`Server is listening on http://localhost:${config.PORT}`);
});

// Envoie d'un event "@logged_in_users" => retourne les activeUsers
// Envoie d'un event dès la connexion d'un nouvel utilisateur