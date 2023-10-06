import { makeApp } from "./app.js";
import DBInstance from "./database/database.js";
import config from "./config.js";

const { app, server } = makeApp(DBInstance);

server.listen(config.PORT, () => {
	console.log(`Server is listening on http://localhost:${config.PORT}`);
});

// Envoie d'un event "@logged_in_users" => retourne les activeUsers
// Envoie d'un event dès la connexion d'un nouvel utilisateur
