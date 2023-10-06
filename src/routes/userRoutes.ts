import express, { Request, Response } from "express";
import { userBodyFormat } from "../requestFormat.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config.js";

require("dotenv").config();

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
	//   const isBodyCorrect = userBodyFormat.validate(req.body);
	//   if (isBodyCorrect.error)
	//     return res.status(400).json({ error: isBodyCorrect.error.details[0].message });

	try {
		const { user, error } =
			await req.app.locals.database.userController.getUser(
				req.body.username
			);

		if (error) return res.status(500).json({ error });

		if (!user || !user.username) {
			// SIGNUP
			const hash = await bcrypt.hash(
				req.body.password,
				config.SALT_ROUNDS
			);
			const { user: newUser, error: signupError } =
				await req.app.locals.database.userController.createUser(
					req.body.username,
					hash
				);

			if (signupError)
				return res.status(500).json({ error: signupError });

			return res.status(200).json({ user: newUser });
		} else {
			// LOGIN
			const pwdCorrect = await bcrypt.compare(
				req.body.password,
				user.password
			);

			if (!pwdCorrect)
				return res.status(401).json({
					error: "Incorrect password.",
					pwderror: pwdCorrect,
				});

			const token = jwt.sign({ userId: user._id }, config.SECRET_KEY, {
				expiresIn: config.TOKEN_EXP,
			});
			res.status(200).json({ userId: user._id, token });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error });
	}
});

router.get("/online", async (req: Request, res: Response) => {
	return res.status(200).send({ onlineUsers: req.app.locals.onlineUsers });
});

export default { userRoutes: router };
