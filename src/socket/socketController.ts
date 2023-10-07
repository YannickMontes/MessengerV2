import type { Database } from "../database/database.js";
import { Server, Socket } from "socket.io";
import { IMessage, EReaction } from "../database/Mongo/Models/MessageModel.js";
import { MongooseID } from "../types.js";

export class SocketController
{
	constructor(private io:Server, private database:Database)
	{
		this.connect();
		this.listenRoomChanged();
	}

	connect()
	{
		this.io.on("connection", (socket) => {
			console.log(`Socket ${socket.id} connected. User id: ${socket.handshake.headers.userid}`);

			this.registerUserOnRooms(socket.handshake.headers.userid as MongooseID, socket);
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

	sendNewMessage(conversationId:MongooseID, newMessage: IMessage | null | undefined)
	{
		if(conversationId)
			this.io.to(conversationId.toString()).emit("@newMessage", {newMessage});
	}
}

	
