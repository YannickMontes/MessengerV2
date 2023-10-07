import express, { Request, Response } from "express";
import joiValidator from "../middleware/joiValidator";
import mongoose from "mongoose";
const router = express.Router();

router.get("/", joiValidator, async (req: Request, res: Response) => {
	const { conversations, error } =
		await req.app.locals.database.conversationController.getAllConversationsForUser(
			res.locals.userId
		);

	if (error) 
		res.status(500).send(error);
	else 
		res.status(200).send(conversations);
});

router.post("/", joiValidator, async (req: Request, res: Response) => {
	let participants = req.body.concernedUsersIds;
	participants.push(res.locals.userId);
	
	let userRes = await req.app.locals.database.userController.getAllUsersWithIds(participants);
	
	if(userRes.error || !userRes.users)
		return res.status(400).send({ error: userRes.error });

	let participantsNames = [];
	for(let participant of userRes.users)
	{
		participantsNames.push(participant.username)
	}
	let {conversation, error} = await req.app.locals.database.conversationController.createConversation(participants, participantsNames);

	if(error)
		return res.status(500).send({ error });
	return res.status(200).send({conversation});
});

//POST MESSAGE
router.post("/:id", joiValidator, async (req: Request, res: Response) => {
	let convResponse = await req.app.locals.database.conversationController.getConversationById(req.params.id);

	if(convResponse.error)
		return res.status(500).send({ error: convResponse.error });

	if (!convResponse.conversation)
		return res.status(404).send({ error: "Conversation not found" });

	let msgResponse = await req.app.locals.database.messageController.createMessage(res.locals.userId
		, req.body.messageContent, req.params.id, req.body.messageReplyId);

	if(msgResponse.error)
		return res.status(500).send({ error: msgResponse.error });
	
	req.app.locals.sockerController.sendNewMessage(req.params.id, msgResponse.message);

	return res.status(200).send({message: msgResponse.message});
});

router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { conversation, error } =
			await req.app.locals.database.conversationController.deleteConversation(
				req.params.id
			);
		if (error) res.status(500).send(error);
		else res.status(200).send(conversation);
	} catch (error) {
		res.status(500).send(error);
	}
});

export default { conversationRoutes: router };
