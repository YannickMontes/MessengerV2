import type { Database } from "../database/database.js";
import { Server, Socket } from "socket.io";
import { IMessage } from "../database/Mongo/Models/MessageModel.js";
import { MongooseID } from "../types.js";
import { IConversation } from "../database/Mongo/Models/ConversationModel.js";
import { IUser } from "../database/Mongo/Models/UserModel.js";

interface ActiveUsers {
	[socketId: string]: {
		userId: MongooseID;
		socket: Socket;
	}
}

export class SocketController
{
	activeUsers: ActiveUsers = {};

	constructor(private io:Server, private database:Database)
	{
		this.connect();
		this.listenRoomChanged();
	}

	connect()
	{
		this.io.on("connection", (socket) => {
			let userId = socket.handshake.headers.userid;
			console.log(`Socket ${socket.id} connected. User id: ${userId}`);

			this.activeUsers[socket.id] = { userId:userId as MongooseID, socket: socket };
			this.registerUserOnRooms(userId as MongooseID, socket);
		});
	}

	listenRoomChanged()
	{
		this.io.of("/").adapter.on("create-room", (room) => {
			console.log(`room ${room} was created`);
		});

		this.io.of("/").adapter.on("join-room", (room, id) => {
			console.log(`socket ${id} has joined room ${room}`);
		});

		this.io.of("/").adapter.on("leave-room", (room, id) => {
			console.log(`socket ${id} has leave room ${room}`);
		});

		this.io.of("/").adapter.on("delete-room", (room) => {
			console.log(`room ${room} was deleted`);
		});
	}

	async registerUserOnRooms(userId: MongooseID, socket:Socket)
	{
		let { conversations, error} = await this.database.conversationController.getAllConversationsForUser(userId)
		if (conversations) {
			for (let conversation of conversations) {
				socket.join(conversation._id.toString()); //ToString needed, otherwise rooms don't work.
			}
		}
	}

	sendNewMessage(conversationId:MongooseID, message: IMessage)
	{
		if(conversationId)
			this.io.to(conversationId.toString()).emit("@newMessage", { message });
	}

	sendNewConversation(conversation: IConversation)
	{
		//Register all sockets to room
		for(let socketId of Object.keys(this.activeUsers))
		{
			let participant = conversation.participants.find((participant) => 
						(participant as IUser)._id == this.activeUsers[socketId].userId);
			if(!participant)
				continue;
			
			this.activeUsers[socketId].socket.join(conversation._id.toString());
		}

		this.io.to(conversation._id.toString()).emit("@newConversation", { conversation });
	}

	sendConversationDeleted(conversation: IConversation)
	{
		this.io.to(conversation._id.toString()).emit("@conversationDeleted", { conversation })

		for (let socketId of Object.keys(this.activeUsers)) 
		{
			let participant = conversation.participants.find(
				(participant) => (participant as IUser)._id == this.activeUsers[socketId].userId);
			if (!participant) 
			continue;

			this.activeUsers[socketId].socket.leave(conversation._id.toString());
		}
	}

	sendSeeConversation(conversation: IConversation)
	{
		this.io.to(conversation._id.toString()).emit("@conversationSeen", { conversation });
	}

	sendEditedMessage(message: IMessage)
	{
		this.io.to((message.conversationId as string)?.toString()).emit("@messageEdited", { message });
	}

	sendReactionAddedToMessage(message: IMessage)
	{
		this.io.to((message.conversationId as string)?.toString()).emit("@reactionAdded", { message });
	}

	sendDeletedMessage(message: IMessage)
	{
		this.io.to((message.conversationId as string)?.toString()).emit("@messageDeleted", { message });
	}
}

