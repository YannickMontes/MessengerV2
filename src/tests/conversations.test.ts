import http from "http";
import supertest from "supertest";
import { Express } from "express";
import { setup, teardown } from "./setupTests";
import { IUser } from "../database/Mongo/Models/UserModel";

describe('CONVERSATIONS', () => 
{
	let app:Express, server:http.Server;
	let user:IUser;
	let userToken:string;
	let convId:string;
	let firstMessageId:string;

	beforeAll(async () => {
		let res = await setup();
		app = res.app; 
		server = res.server;
		user = res.user;
		userToken = res.userToken;
	});

	afterAll(async () => {
		await teardown();
	});

	test("CREATE Conversation success", async () => {
		let { user, error } = await app.locals.database.userController.getUser("otherTest");
		let res = await supertest(app)
			.post("/conversations/")
			.set("Authorization", userToken)
			.send({concernedUsersIds: [user?._id]});
		
		expect(res.status).toBe(200);
		expect(res.body.conversation).toBeDefined();
	});

	test("CREATE Conversation wrong users", async () => {
		let { user, error } = await app.locals.database.userController.getUser(
			"otherTest"
		);
		let res = await supertest(app)
			.post("/conversations/")
			.set("Authorization", userToken)
			.send({ concernedUsersIds: ["652bc993919707905cdb0000"] });

		expect(res.status).toBe(400);
		expect(res.body.conversation).toBeUndefined();
		expect(res.body.error).toBeDefined();
	});

	test("GET All conversation success", async () => {
		let res = await supertest(app)
			.get("/conversations/")
			.set("Authorization", userToken)
			.send();

		expect(res.status).toBe(200);
		expect(res.body.conversations).toBeDefined();
		expect(res.body.error).toBeUndefined();

		convId = res.body.conversations[0]._id;
	});

	test("POST Message in conversation", async () => {
		let res = await supertest(app)
			.post("/conversations/" + convId)
			.set("Authorization", userToken)
			.send({ messageContent: "Test" });

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
		expect(res.body.message.replyTo).toBeNull();
		expect(res.body.error).toBeUndefined();
		
		firstMessageId = res.body.message._id;
	});

	test("POST Reply message in conversation", async () => {
		let res = await supertest(app)
			.post("/conversations/" + convId)
			.set("Authorization", userToken)
			.send({ messageContent: "Test reply", messageReplyId: firstMessageId });

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
		expect(res.body.message.replyTo).toBeDefined();
		expect(res.body.error).toBeUndefined();
	});

	test("POST Reply message in conversation", async () => {
		let res = await supertest(app)
			.post("/conversations/" + convId)
			.set("Authorization", userToken)
			.send({
				messageContent: "Test reply",
				messageReplyId: firstMessageId,
			});

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
		expect(res.body.message.replyTo).toBeDefined();
		expect(res.body.error).toBeUndefined();
	});

	test("PUT Edit message in conversation", async () => {
		let res = await supertest(app)
			.put("/messages/" + firstMessageId)
			.set("Authorization", userToken)
			.send({
				newMessageContent: "EDIT",
			});

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
		expect(res.body.message.content).toBe("EDIT");
		expect(res.body.error).toBeUndefined();
	});

	test("POST React message in conversation", async () => {
		let res = await supertest(app)
			.post("/messages/" + firstMessageId)
			.set("Authorization", userToken)
			.send({
				reaction: "HAPPY",
			});

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
		expect(res.body.error).toBeUndefined();
	});

	test("POST See conversation", async () => {
		let res = await supertest(app)
			.post("/conversation/see/" + convId)
			.set("Authorization", userToken)
			.send({
				messageId: firstMessageId,
			});
	});

	test("DELETE Message in conversation", async () => {
		let res = await supertest(app)
			.delete("/messages/" + firstMessageId)
			.set("Authorization", userToken)
			.send();

		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
		expect(res.body.error).toBeUndefined();
	});

	test("DELETE Conversation", async () => {
		let res = await supertest(app)
			.delete("/conversations/" + convId)
			.set("Authorization", userToken)
			.send();

		expect(res.status).toBe(200);
		expect(res.body.conversation).toBeDefined();
		expect(res.body.error).toBeUndefined();
	});
});