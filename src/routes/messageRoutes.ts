import express, { Request, Response } from "express";
import joiValidator from "../middleware/joiValidator";
import mongoose from "mongoose";

const router = express.Router();

router.put("/:id", joiValidator, async (req:Request, res:Response) => {
	if(!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send({error: "Requested message id is not a correct id."});

	let msgResponse = await req.app.locals.database.messageController.editMessage(req.params.id, req.body.newMessageContent);

	if(msgResponse.error)
	{
		return res.status(500).send({error: msgResponse.error});
	}
	else if(!msgResponse.message)
	{
		return res.status(404).send({error: "Message not found."});
	}
	else
	{
		req.app.locals.sockerController.sendEditedMessage(msgResponse.message);
		return res.status(200).send({message: msgResponse.message});
	}
});

router.post("/:id", joiValidator, async (req: Request, res: Response) => {
	if(!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send({error: "Requested message id is not a correct id."});

	let msgResponse = await req.app.locals.database.messageController.reactToMessage(res.locals.userId, req.params.id, req.body.reaction);

	if (msgResponse.error)
	{
		return res.status(500).send({ error: msgResponse.error });
	}
	else if (!msgResponse.message)
	{
		return res.status(404).send({ error: "Message not found." });
	}
	else
	{
		req.app.locals.sockerController.sendReactionAddedToMessage(msgResponse.message);
		return res.status(200).send({ message: msgResponse.message });
	}
});

router.delete("/:id", async (req:Request, res: Response) => {
	if(!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send({error: "Requested message id is not a correct id."});

	let msgResponse = await req.app.locals.database.messageController.deleteMessage(req.params.id);

	if (msgResponse.error)
	{
		return res.status(500).send({ error: msgResponse.error });
	}
	else if (!msgResponse.message)
	{
		return res.status(404).send({ error: "Message not found." });
	}
	else
	{
		req.app.locals.sockerController.sendDeletedMessage(msgResponse.message);
		return res.status(200).send({ message: msgResponse.message });
	}
});

export default { messagesRoutes: router };