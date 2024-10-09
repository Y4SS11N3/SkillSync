const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const sequelize = require('./database/connection');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRouters');
const chatRoutes = require('./routes/chatRoutes');
const liveExchangeRoutes = require('./routes/liveExchangeRoutes');
const initialSetupRoutes = require('./routes/initialSetupRoutes');
const sanitizeResponse = require('./middlewares/Sanitize');
const cors = require('cors');
const { setupAssociations } = require('./models/associations');
const http = require('http');
const socketIo = require('socket.io');
const LiveExchangeController = require('./controllers/liveExchangeController');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(sanitizeResponse);

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
];

// Store active sessions
const activeSessions = new Map();
const userSockets = new Map();
const socketUsers = new Map();

const liveExchangeController = new LiveExchangeController(io);

io.on('connection', (socket) => {

  socket.emit('iceServers', iceServers);

  socket.on('create or join', (room) => {

    const clientsInRoom = io.sockets.adapter.rooms.get(room);
    const numClients = clientsInRoom ? clientsInRoom.size : 0;

    if (numClients === 0) {
      socket.join(room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 1) {
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
    } else {
      socket.emit('full', room);
    }
  });



  
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
  });

  socket.on('new_message', (message) => {
    const roomName = `chat_${message.chatId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    
    if (room) {
      io.to(roomName).emit('new_message', message);
    } else {
      console.warn(`[WebSocket] Attempted to broadcast to non-existent room: ${roomName}`);
      socket.emit('new_message', message);
    }
  });


  socket.on('join_live_session', ({ sessionId, isInitiator, userId, token }) => {
    
    const roomName = `live_session_${sessionId}`;
    socket.join(roomName);
    
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, new Map());
    }
    activeSessions.get(sessionId).set(socket.id, { userId, isInitiator });
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    

    const req = {
      params: { sessionId },
      body: { token },
      socketId: socket.id,
      user: { id: userId }
    };
  
  
    const res = {
      json: (data) => {
      },
      status: (statusCode) => {
        return {
          json: (data) => {
            socket.emit('join_live_session_response', { status: statusCode, ...data });
          }
        };
      }
    };
  
    liveExchangeController.joinSession(req, res);
  });

  socket.on('leave_live_session', (sessionId) => {
    const roomName = `live_session_${sessionId}`;
    socket.leave(roomName);
    if (activeSessions.has(sessionId)) {
      activeSessions.get(sessionId).delete(socket.id);
      if (activeSessions.get(sessionId).size === 0) {
        activeSessions.delete(sessionId);
      }
    }
    io.to(roomName).emit('user_left_session', { socketId: socket.id });
  });

  socket.on('message', (message, room) => {
    socket.to(room).emit('message', message, socket.id);
  });

  socket.on('signal', ({ to, signal, sessionId, isScreenSharing }) => {
    if (isScreenSharing) {
    }
    
    const targetSocketId = userSockets.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('signal', { 
        from: socketUsers.get(socket.id), 
        signal,
        sessionId,
        isScreenSharing
      });
    } else {
      socket.emit('signal_error', { 
        to, 
        error: 'Target user not found', 
        sessionId 
      });
    }
  });
  
  socket.on('ice_candidate', ({ to, candidates, sessionId, isScreenSharing }) => {
    const targetSocketId = userSockets.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice_candidate', { 
        from: socketUsers.get(socket.id), 
        candidates,
        sessionId,
        isScreenSharing
      });
    } else {
      socket.emit('ice_candidate_error', { 
        to, 
        error: 'Target user not found', 
        sessionId 
      });
    }
  });
  
  socket.on('screen_share_signal', ({ to, signal, sessionId, isScreenSharing }) => {
    const targetSocketId = userSockets.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('screen_share_signal', { 
        from: socketUsers.get(socket.id), 
        signal,
        sessionId,
        isScreenSharing
      });
    } else {
      console.error(`Target socket for user ${to} not found for screen sharing signaling in session ${sessionId}`);
      socket.emit('screen_share_signal_error', { 
        to, 
        error: 'Target user not found', 
        sessionId 
      });
    }
  });

  socket.on('start_screen_share', async ({ sessionId }) => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      try {
        const roomName = `live_session_${sessionId}`;
        io.to(roomName).emit('screen_share_started', { from: userId });
      } catch (error) {
        console.error(`Error starting screen share: ${error.message}`);
        socket.emit('screen_share_error', { error: error.message });
      }
    } else {
      console.error(`User not found for socket ${socket.id} when starting screen share`);
      socket.emit('screen_share_error', { error: 'User not found' });
    }
  });
  
  socket.on('stop_screen_share', ({ sessionId }) => {
    const userId = socketUsers.get(socket.id);
    const roomName = `live_session_${sessionId}`;
    io.to(roomName).emit('screen_share_stopped', { from: userId });
  });

  socket.on('webrtc_error', (error) => {
    console.error(`WebRTC error for socket ${socket.id}:`, error);
  });

  socket.on('sync_editor_operation', async ({ sessionId, operation, data }) => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      try {
        const roomName = `live_session_${sessionId}`;
        await liveExchangeController.handleSyncEditorOperation({ 
          params: { sessionId }, 
          body: { operation, data }, 
          user: { id: userId } 
        }, {
          status: () => ({
            json: (data) => {
              io.to(roomName).emit('sync_editor_operation', { 
                from: userId, 
                operation, 
                data 
              });
            }
          })
        });
      } catch (error) {
        console.error(`Error handling sync editor operation: ${error.message}`);
        socket.emit('sync_editor_error', { error: error.message });
      }
    } else {
      console.error(`User not found for socket ${socket.id} when handling sync editor operation`);
      socket.emit('sync_editor_error', { error: 'User not found' });
    }
  });

  socket.on('connection_state_change', (state) => {
  });

  socket.on('chat_message', ({ sessionId, message }) => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      const roomName = `live_session_${sessionId}`;
      io.to(roomName).emit('chat_message', { 
        from: userId,
        message,
        timestamp: new Date()
      });
    } else {
      console.error(`User not found for socket ${socket.id} when sending chat message`);
      socket.emit('chat_error', { error: 'User not found' });
    }
  });

  socket.on('disconnect', () => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
    }
    for (const [sessionId, users] of activeSessions.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          activeSessions.delete(sessionId);
        } else {
          const roomName = `live_session_${sessionId}`;
          io.to(roomName).emit('user_left_session', { socketId: socket.id, userId });
        }
      }
    }
  });
});

// Pass io to routes that need it
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/initial-setup', initialSetupRoutes);
app.use('/api/exchanges', (req, res, next) => {
  req.io = io;
  next();
}, exchangeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes(io));
app.use('/api/chat', (req, res, next) => {
  req.io = io;
  next();
}, chatRoutes);
app.use('/api/live-exchange', (req, res, next) => {
  req.io = io;
  next();
}, liveExchangeRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established.');
    setupAssociations();
    return sequelize.sync();
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });