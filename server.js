const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");              
const { Server } = require("socket.io");   

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const tokenRoutes = require("./src/routes/tokenRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);   

const io = new Server(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"]
  }
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/token", tokenRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("SecureOrder API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});