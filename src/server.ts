import { makeApp } from "./app";
import DBInstance from "./database/database";
import config from "./config";

const { app, server } = makeApp(DBInstance);

server.listen(config.PORT, () => {
	console.log(`Server is listening on http://localhost:${config.PORT}`);
});

// Envoie d'un event "@logged_in_users" => retourne les activeUsers
// Envoie d'un event dès la connexion d'un nouvel utilisateur
