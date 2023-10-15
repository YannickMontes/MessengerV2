import { NextFunction, Request, Response } from "express";

export default function requestLogger(req: Request, res: Response, next: NextFunction)
{
	console.log(`[REQ]${req.originalUrl} from ${req.hostname} (${req.ip})`);
	next();
}
