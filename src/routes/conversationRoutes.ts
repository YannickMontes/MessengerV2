import express, { Request, Response } from "express";
import joiValidator from "../middleware/joiValidator";
import { IConversation } from "../database/Mongo/Models/ConversationModel";
import mongoose from "mongoose";
const router = express.Router();

router.get("/", joiValidator, async (req: Request, res: Response) => {
	const { conversations, error } =
		await req.app.locals.database.conversationController.getAllConversationsForUser(
			res.locals.userId
		);

	if (error) 
		res.status(500).send({ error });
	else 
		res.status(200).send({ conversations });
});

router.post("/", joiValidator, async (req: Request, res: Response) => {
	for (let userId of req.body.concernedUsersIds)
	{
		if (!mongoose.isValidObjectId(userId))
		{
			console.log(false);
			return res.status(400).send({error: "Concerned user ID " + userId + "is not an id."});
		}
	}

	let participants = req.body.concernedUsersIds;
	participants.push(res.locals.userId);
	
	let convRes = await req.app.locals.database.conversationController.getConversationWithParticipants(participants);

	if(convRes.error)
		return res.status(500).send({ error: convRes.error });

	if(convRes.conversation)
		return res.status(200).send({ conversation: convRes.conversation });

	let userRes = await req.app.locals.database.userController.getAllUsersWithIds(participants);
	
	if(userRes.error || !userRes.users)
		return res.status(400).send({ error: userRes.error });

	if(userRes.users.length != participants.length)
	{
		let missingsUsers = "";
		for(let participant of participants)
		{
			let isContains = userRes.users.find(user => user._id == participant);
			if(!isContains)
				missingsUsers += (missingsUsers == "" ? "" : ", ") + participant;
		}

		return res.status(400).send({ error: "Users not found: " + missingsUsers });
	}

	let participantsNames = [];
	for(let participant of userRes.users)
	{
		participantsNames.push(participant.username) 
	}
	let {conversation, error} = await req.app.locals.database.conversationController.createConversation(participants, participantsNames);

	if(error)
		return res.status(500).send({ error });

	req.app.locals.sockerController.sendNewConversation(conversation as IConversation);

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

	if(msgResponse.error || !msgResponse.message)
		return res.status(500).send({ error: msgResponse.error });

	let addMsgToConvRes = await req.app.locals.database.conversationController.addMessageToConversation(convResponse.conversation, msgResponse.message._id);
	
	if(msgResponse.error || !addMsgToConvRes.conversation)
		return res.status(500).send({error: addMsgToConvRes.error});

	req.app.locals.sockerController.sendNewMessage(req.params.id, msgResponse.message);

	return res.status(200).send({message: msgResponse.message});
});

router.post("/see/:id", joiValidator, async (req: Request, res: Response) => {
	if(!mongoose.isValidObjectId(req.params.id))
		return res.status(400).send({error: "Requested conversation id is not a correct id."});

	if(!mongoose.isValidObjectId(req.body.messageId))
		return res.status(400).send({error: "Seen messageId is not a correct id."});

	let userRes = await req.app.locals.database.userController.getUserById(res.locals.userId);

	if (userRes.error) 
		return res.status(500).send({ error: userRes.error });

	if(!userRes.user)
		return res.status(404).send({ error: "User not found." });

	let seeConvRes = await req.app.locals.database.conversationController.setConversationSeenForUserAndMessage(userRes.user
		, req.params.id, req.body.messageId);

	if (seeConvRes.error ||	!seeConvRes.conversation)
		return res.status(500).send({ error: seeConvRes.error });

	req.app.locals.sockerController.sendSeeConversation(seeConvRes.conversation);

	return res.status(200).send({conversation: seeConvRes.conversation});
});

router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { conversation, error } =
			await req.app.locals.database.conversationController.deleteConversation(
				req.params.id
			);
		if (error)
		{
			return res.status(500).send({error});
		} 
		else if(conversation)
		{
			req.app.locals.sockerController.sendConversationDeleted(conversation);

			return res.status(200).send({conversation});
		}
	} catch (error) {
		return res.status(500).send({error});
	}
});

export default { conversationRoutes: router };
