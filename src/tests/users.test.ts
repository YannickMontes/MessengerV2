import http from "http";
import { Express } from "express";
import { setup, teardown } from "./setupTests";
import supertest from "supertest";

describe('USERS', () => 
{
	let app:Express, server:http.Server;

	beforeAll(async () => {
		let res = await setup();
		app = res.app; 
		server = res.server;
	});

	afterAll(async () => {
		await teardown();
	});

	test("Login unexisting user", async () => {
		let res = await supertest(app)
			.post("/users/login")
			.send({ username: "notexisting", password:"notexistingpwd"});
		
		expect(res.status).toBe(200);
		expect(res.body.user).toBeDefined();
		expect(res.body.token).toBeDefined();
		expect(res.body.isNewUser).toBeTruthy();
	});

	test("Login existing user", async () => {
		let res = await supertest(app)
			.post("/users/login")
			.send({ username: "notexisting", password: "notexistingpwd" });

		expect(res.status).toBe(200);
		expect(res.body.user).toBeDefined();
		expect(res.body.token).toBeDefined();
		expect(res.body.isNewUser).toBeFalsy();
	});

	test("Login wrong password", async () => {
		let res = await supertest(app)
			.post("/users/login")
			.send({ username: "notexisting", password: "wrongpassword" });

		expect(res.status).toBe(401);
		expect(res.body.user).toBeUndefined();
		expect(res.body.token).toBeUndefined();
		expect(res.body.error).toBeDefined();
	});

	test("GET active users", async () => {
		let res = await supertest(app)
			.get("/users/online");

		expect(res.status).toBe(200);
		expect(res.body.users).toBeDefined();
		expect(res.body.error).toBeUndefined();
	});
});