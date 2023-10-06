import type { Database } from "../database/database.js";
import { Server, Socket } from "socket.io";
import { IMessage, Reaction } from "../database/Mongo/Models/MessageModel.js";

interface ActiveUsers {
	[socketId: string]: string;
}

const activeUsers: ActiveUsers = {};

function onSocketConnection(io: Server, socket: Socket, database: Database) {
	console.log("Socket connected");

	socket.on("@connected", (data: { username: string }, callback) =>
		onConnected(data, callback, socket, database)
	);

	socket.on("@newMessage", async (data: { username: string; conversationId: string; messageContent: string; messageReplyId: string | undefined; },
			callback ) => {
			await onNewMessage(data, callback, socket, database);
		});
	
	socket.on("@createConversation", async (data: {username: string, concernedUsers:string[]}, callback) => {
		await createConversation(data, callback, socket, database);
	});

	socket.on("@editMessage", async (data: {messageId: string, newContent: string, conversationId: string}, callback) => {
		await editMessage(data, callback, socket, database);
	});

	socket.on("@reactMessage", async (data: {username: string, messageId: string, conversationId: string, reaction: Reaction}, callback) => {
		await reactMessage(data, callback, socket, database);
	});

	socket.on("@deleteMessage", async (data: {messageId: string, conversationId: string}, callback) => {
		await deleteMessage(data, callback, socket, database);
	});

	socket.on("disconnect", (reason) => onDisconnected(io, socket));
}

function onConnected({ username }: { username: string }, callback: Function, socket: Socket, database: Database) 
{
	activeUsers[socket.id] = username;
	callback({ status: 200, message: "OK" });
}

function onDisconnected(io: Server, socket: Socket) 
{
	delete activeUsers[socket.id];
}

async function onNewMessage( { username, conversationId, messageContent, messageReplyId }: 
		{ username: string; conversationId: string; messageContent: string; messageReplyId: string | undefined; },
	callback: Function,
	socket: Socket,
	database: Database) 
{
	try {
		let replyMessage: IMessage | null = null;
		if(messageReplyId)
		{
			const msgResponse = await database.messageController.getMessageById(messageReplyId);
		
			if (msgResponse.error) {
				callback({ status: 500, message: msgResponse.error });
				return;
			}
	
			if (!msgResponse.message) {
				callback({ status: 404, message: "No reply message found" });
				return;
			}

			replyMessage = msgResponse.message;
		}
		
		
		const convResponse = await database.conversationController.getConversationById(conversationId);
		
		if (convResponse.error) {
			callback({ status: 500, message: convResponse.error });
			return;
		}
		
		if(!convResponse.conversation){
			callback({ status: 404, message: "No conversation found."});
			return;
		}
		
		const msgResponse = await database.messageController.createMessage(username, messageContent, conversationId, replyMessage?._id);

		if (msgResponse.error || !msgResponse.message) {
			callback({ status: 500, message: msgResponse.error });
			return;
		}

		let convUpdate = await database.conversationController.addMessageToConversation(convResponse.conversation, msgResponse.message._id);
		
		if(convUpdate.error)
		{
			callback({status: 500, message: convUpdate.error});
			return;
		}
		callback({status: 200, message: convUpdate.conversation});
	} catch (error) {
		callback({ status: 500, message: "Internal server error" });
	}
}

async function createConversation( { username, concernedUsers }: 
			{ username: string; concernedUsers: string[]; },
		callback: Function,
		socket: Socket,
		database: Database)
{
	concernedUsers.push(username);
	let convResponse = await database.conversationController.getConversationWithParticipants(concernedUsers);
	
	if(convResponse.error)
	{
		callback({ status: 500, message: convResponse.error });
		return;
	}

	if(convResponse.conversation)
	{
		callback({status: 200, message: convResponse.conversation });
		return;
	}

	let allUsersPromises = [];
	for(let participantId of concernedUsers)
	{
		allUsersPromises.push(database.userController.getUserById(participantId));
	}
	let allUsersRes = await Promise.all(allUsersPromises);

	let userNames = [];
	for(let userResult of allUsersRes)
	{
		if(userResult.error)
		{
			callback({ status: 500, message: userResult.error });
			return;
		}

		if(!userResult.user)
		{
			callback({ status: 404, message: "User not found." });
			return;
		}

		userNames.push(userResult.user?.username);
	}

	convResponse = await database.conversationController.createConversation(concernedUsers, userNames);
	
	if(convResponse.error)
	{
		callback({ status: 500, message: convResponse.error });
		return;
	}

	if(convResponse.conversation)
	{
		callback({status: 200, message: convResponse.conversation });
		return;
	}
}

async function editMessage( { messageId, newContent, conversationId }: 
			{ messageId: string; newContent: string; conversationId: string; },
		callback: Function,
		socket: Socket,
		database: Database)
{
	let msgResponse = await database.messageController.editMessage(messageId, newContent);
	if(msgResponse.error)
	{
		callback({status: 500, message: msgResponse.error});
		return;
	}
	if(!msgResponse.message)
	{
		callback({status: 404, message: "Wanted message to edit not found"});
		return;
	}
	callback({status: 200, message: msgResponse.message});
}

async function reactMessage( { username, messageId, reaction, conversationId }: 
			{ username:string, messageId: string; reaction: Reaction; conversationId: string; },
		callback: Function,
		socket: Socket,
		database: Database)
{
	let enumCorrect = Object.values(Reaction).includes(reaction);

	if(!enumCorrect)
	{
		callback({status: 401, message: "You have to provide a valid enum type for 'reaction'. (HAPPY, LOVE, THUMBSUP, THUMBSDOWN, SAD)"});
		return;
	}

	let msgResponse = await database.messageController.reactToMessage(username, messageId, reaction);
	if(msgResponse.error)
	{
		callback({status: 500, message: msgResponse.error});
		return;
	}
	if(!msgResponse.message)
	{
		callback({status: 404, message: "Wanted message to react not found"});
		return;
	}
	callback({status: 200, message: msgResponse.message});
}

async function deleteMessage( { messageId, conversationId }: 
	{ messageId: string; conversationId: string; },
callback: Function,
socket: Socket,
database: Database)
{
	let msgResponse = await database.messageController.deleteMessage(messageId);
	if(msgResponse.error)
	{
		callback({status: 500, message: msgResponse.error});
		return;
	}
	if(!msgResponse.message)
	{
		callback({status: 404, message: "Wanted message to delete not found"});
		return;
	}
	callback({status: 200, message: msgResponse.message});
}

export default onSocketConnection;
