// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('receive_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

// Store rooms: roomName -> [socketIds]
const rooms = {};
const typingUsersRoom = {}; // roomName -> [usernames]

// Join a room
socket.on("join_room", (roomName) => {
  socket.join(roomName);

  if (!rooms[roomName]) rooms[roomName] = [];
  if (!rooms[roomName].includes(socket.id)) rooms[roomName].push(socket.id);

  if (!typingUsersRoom[roomName]) typingUsersRoom[roomName] = [];

  io.to(roomName).emit("room_message", {
    senderName: "System",
    text: `${users[socket.id]?.username || "Someone"} joined ${roomName}`,
  });
});

// Send a message to a room
socket.on("send_room_message", ({ roomName, text }) => {
  const messageData = {
    senderName: users[socket.id]?.username || "Anonymous",
    senderId: socket.id,
    text,
    timestamp: new Date().toISOString(),
  };
  io.to(roomName).emit("room_message", messageData);
});

// Typing in a room
socket.on("typing_room", ({ roomName, isTyping }) => {
  if (!users[socket.id]) return;
  const username = users[socket.id].username;

  if (!typingUsersRoom[roomName]) typingUsersRoom[roomName] = [];

  if (isTyping) {
    if (!typingUsersRoom[roomName].includes(username))
      typingUsersRoom[roomName].push(username);
  } else {
    typingUsersRoom[roomName] = typingUsersRoom[roomName].filter((u) => u !== username);
  }

  io.to(roomName).emit("typing_users_room", typingUsersRoom[roomName]);
});

// --- File/Image sharing ---
socket.on("send_file", ({ roomName, file }) => {
  const messageData = {
    id: Date.now(),
    senderName: users[socket.id]?.username || "Anonymous",
    senderId: socket.id,
    file, // store file object
    timestamp: new Date().toISOString(),
  };

  if (roomName) {
    io.to(roomName).emit("room_message", messageData);
  } else {
    io.emit("receive_message", messageData);
  }

  // Store in global messages array
  messages.push(messageData);
  if (messages.length > 100) messages.shift();
});
// --- New: Reactions and Read Receipts ---
socket.on("add_reaction", ({ messageId, reaction, userName }) => {
  const message = messages.find((m) => m.id === messageId);
  if (message) {
    if (!message.reactions) message.reactions = [];
    message.reactions.push({ reaction, userName });
    io.emit("update_message", message);
  }
});

socket.on("mark_read", ({ messageId, userName }) => {
  const message = messages.find((m) => m.id === messageId);
  if (message) {
    if (!message.readBy) message.readBy = [];
    if (!message.readBy.includes(userName)) message.readBy.push(userName);
    io.emit("update_message", message);
  }
});


  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 


