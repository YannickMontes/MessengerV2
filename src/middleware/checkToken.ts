import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import config from "../config.js";

async function checkToken(req: Request, res: Response, next: NextFunction) {
	let token = req.headers.authorization;

	if (!token) {
		return res.status(401).json({ error: "Need to provide a token." });
	}
	try {
		let tokenCorrect = jwt.verify(token, config.SECRET_KEY);
		if (!tokenCorrect) {
			return res.status(401).json({ error: "Unauthorized token" });
		}
		//@ts-ignore
		res.locals.userId = tokenCorrect.userId;
		next();
	} catch (error) {
		return res.status(401).json({ error });
	}
}

export default checkToken;
