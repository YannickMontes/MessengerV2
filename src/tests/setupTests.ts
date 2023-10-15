require("ts-node/register");
import http from "http";
import supertest from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Database from "../database/database";
import { conversationController } from "../database/Mongo/Controllers/conversationController";
import { messageController } from "../database/Mongo/Controllers/messageController";
import { userController } from "../database/Mongo/Controllers/userController";
import { makeApp } from "../app";
import config from "../config";
import { IUser } from "../database/Mongo/Models/UserModel";

interface SetupResult {
	server: http.Server,
	app: Express,
	user: IUser,
	userToken: string
}

async function setup(): Promise<SetupResult> 
{
	let database = new Database(
		conversationController,
		messageController,
		userController,
		true
	);

	await database.connect();

	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}

	let testPwd = await bcrypt.hash("testpwd", config.SALT_ROUNDS);
	let otherTestPwd = await bcrypt.hash("testpwd", config.SALT_ROUNDS);
	await userController.createUser("test", testPwd);
	await userController.createUser("otherTest", otherTestPwd);

	let { app , server } =  makeApp(database);

	let res = await supertest(app)
		.post("/users/login")
		.send({username: "test", password:"testpwd"});

	let userToken:string = res.body.token;
	let user:IUser = res.body.user;

	return {
		app,
		server,
		userToken,
		user
	};
}

async function teardown()
{
	await mongoose.disconnect();
}

export { setup, teardown };
