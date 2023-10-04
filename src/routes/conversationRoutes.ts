import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
	let { user, error } =
		await req.app.locals.database.userController.getUserById(
			res.locals.userId
		);
	if (error) return res.status(404).json({ error });

	try {
		const { conversations, error } =
			await req.app.locals.database.conversationController.getAllConversationsForUser(
				user.username
			);

		if (error) res.status(500).send(error);
		else res.status(200).send(conversations);
	} catch (error) {
		res.status(500).send(error);
	}
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
