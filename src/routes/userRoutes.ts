import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import joiValidator from "../middleware/joiValidator";
import { MongooseID } from "../types";
import { IUser } from "../database/Mongo/Models/UserModel";

require("dotenv").config();

const router = express.Router();

router.post("/login", joiValidator, async (req: Request, res: Response) => {
	try 
	{
		let userRes =
		await req.app.locals.database.userController.getUser(
			req.body.username
			);
			
		if (userRes.error) 
			return res.status(500).json({ error: userRes.error });

		let user: IUser | null | undefined = userRes.user;
		let isNewUser:boolean;
		if (!user || !user.username) {
			// SIGNUP
			const hash = await bcrypt.hash(
				req.body.password,
				config.SALT_ROUNDS
			);
			const createUserRes =
				await req.app.locals.database.userController.createUser(
					req.body.username,
					hash
				);

			if (createUserRes.error || !createUserRes.user)
				return res.status(500).json({ error: createUserRes.error });

			user = createUserRes.user;
			isNewUser = true;
		} 
		else 
		{
			// LOGIN
			const pwdCorrect = await bcrypt.compare(
				req.body.password,
				user.password
			);

			if (!pwdCorrect)
				return res.status(401).json( {error: "Incorrect password."});
			isNewUser = false;
		}
		const token = jwt.sign({ userId: user._id }
			, config.SECRET_KEY
			, { expiresIn: config.TOKEN_EXP});
		//@ts-ignore
		user.password = undefined;
		res.status(200).json({ user, token, isNewUser });
	} 
	catch (error) 
	{
		console.log(error);
		return res.status(500).json({ error });
	}
});

router.get("/online", async (req: Request, res: Response) => 
{
	let ids:MongooseID[] = [];
	for(let activeUser of Object.values(req.app.locals.sockerController.activeUsers))
	{
		ids.push(activeUser.userId);
	}

	let {users, error } = await req.app.locals.database.userController.getAllUsersWithIds(ids);
	if(error)
	{
		return res.status(500).send({error});
	}
	else
	{
		return res.status(200).send({ users });
	}
});

export default { userRoutes: router };
