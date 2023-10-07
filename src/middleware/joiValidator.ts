import { JoiRequestValidatorInstance } from "../JoiRequestValidator";
import { Request, Response, NextFunction } from "express";

async function joiValidator(req: Request, res: Response, next: NextFunction) 
{
	let { error } = JoiRequestValidatorInstance.validate(req);

	if(error)
		return res.status(400).send({ error });

	next();
}

export default joiValidator;