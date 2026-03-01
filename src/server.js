require('dotenv').config();
// global error handling for uncaught exceptions/rejections
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const connectDB = require('./config/database');
const seed = require('./utils/seed');
const laterQueueJob = require('./jobs/laterQueueProcessor');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: process.env.FRONTEND_URL || '*' } });

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// attach socket
app.set('socketio', io);
// authenticate socket connections using JWT
const jwt = require('jsonwebtoken');
const User = require('./models/User');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    // require token for all socket connections
    if (!token) return next(new Error('unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('unauthorized'));
    socket.user = user; // attach user to socket
    return next();
  } catch (err) {
    return next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  logger.info('socket connected: ' + socket.id + (socket.user ? ` user:${socket.user.email}` : ''));
});

// routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/audit-logs', require('./routes/audit.routes'));
app.use('/api/rules', require('./routes/rule.routes'));
app.use('/api/metrics', require('./routes/metrics.routes'));
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/later-queue', require('./routes/laterQueue.routes'));

// error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  console.log('Starting application...');
  await connectDB();
  console.log('Connected to database');
  await seed.createUsersAndRules();
  laterQueueJob.start();
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    logger.info(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} already in use. Please free the port or set PORT to a different value.`);
      process.exit(1);
    }
    logger.error('Server error', err);
  });
};

start();
