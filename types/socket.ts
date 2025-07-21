// types/socket.ts
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { Socket } from "net";

// Extend the Socket type to include the server property
interface SocketWithServer extends Socket {
	server: HttpServer;
}

// Create a proper interface that extends NextApiResponse
export interface NextApiResponseWithSocket extends NextApiResponse {
	socket: SocketWithServer & {
		server: HttpServer & {
			io?: SocketIOServer;
		};
	};
}

// Alternative approach - create a separate interface for Socket.IO
export interface SocketServer {
	io?: SocketIOServer;
}

// Use this in your API routes
export interface ApiResponseWithIO extends NextApiResponse {
	socket: {
		server: HttpServer & SocketServer;
	};
}
