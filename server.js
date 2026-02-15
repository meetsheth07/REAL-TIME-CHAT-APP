const dotenv = require("dotenv");
dotenv.config(); // Must be first

// Validate critical environment variables immediately
if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET not configured in .env");
}
if (!process.env.MONGO_URI) {
    throw new Error("FATAL ERROR: MONGO_URI not configured in .env");
}

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection with enhanced error handling
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // Exit process on DB connection failure
    });

// Routes
const routes = [
    require("./routes/auth"),
    require("./routes/user"),
    require("./routes/chat"),
    require("./routes/message")
];

app.use("/api/auth", routes[0]);
app.use("/api/user", routes[1]);
app.use("/api/chat", routes[2]);
app.use("/api/message", routes[3]);

// Health Check Endpoint
app.get("/", (req, res) => res.json({ 
    status: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
}));

// Error Handling
app.use((err, req, res, next) => {
    console.error("🚨 Error:", err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal Server Error",
            code: err.code || "UNKNOWN_ERROR"
        }
    });
});

// Server Initialization
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});

// Socket.IO Configuration
const { Server } = require("socket.io");
const io = new Server(server, {
    pingTimeout: 60000,
    connectionStateRecovery: {},
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// Socket.IO Event Handlers
io.on("connection", (socket) => {
    console.log(`🟢 New connection: ${socket.id}`);

    socket.on("setup", (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`👤 User ${userId} connected`);
            socket.emit("connection-status", "connected");
        }
    });

    socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(`💬 User joined chat: ${chatId}`);
    });

    socket.on("new-message", (message) => {
        if (!message?.chat?.users) return;
        
        message.chat.users.forEach(user => {
            if (user._id !== message.sender._id) {
                socket.to(user._id).emit("message-received", message);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Disconnected: ${socket.id}`);
    });
});

// Handle shutdown gracefully
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down gracefully...");
    server.close(() => {
        console.log("✅ Server closed");
        mongoose.connection.close(false, () => {
            console.log("✅ MongoDB connection closed");
            process.exit(0);
        });
    });
});