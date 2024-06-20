const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST']
    }
});

const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));



// Middleware to set Access-Control-Allow-Origin header
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  res.send('success!');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  // Example: Handle incoming messages
  socket.on('message', (data) => {
    console.log('Received message:', data);
    socket.emit('message', `Server received: ${data}`);
  });

  // Example: Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});
