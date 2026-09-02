import { io } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"; // Default if undefined

const socket = io(ENDPOINT, {
	reconnectionDelay: 1000,
	reconnection: true,
	reconnectionAttempts: 10,
	transports: ["websocket", "polling"], // Polling fallback
	agent: false,
	upgrade: true, // Allow upgrade from polling to websocket
	rejectUnauthorized: false,
});

console.log("Connecting to socket at:", ENDPOINT); // Debugging output

export default socket;
