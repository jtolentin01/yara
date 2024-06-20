const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./api/routes/index');
const models = require('./api/models/index');

const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server with the HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// NODE_ENV='production'
// app.use(cors({credentials: true, origin: 'https://orderswift.outdoorequippedservice.com'}));

// NODE_ENV='development'
app.use(cors());

routes.initRoutes({ app });
models.connectDB();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, './client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
    });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Handle incoming messages
  socket.on('message', (data) => {
    console.log('Received message:', data);
    socket.emit('message', `Server received: ${data} server replies: We received your message client`);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(port, () => console.log(`Server running on port ${port}`));
