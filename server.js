const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./api/routes/index');
const models = require('./api/models/index');
const wsOnInit = require('./api/controllers/ws/index');

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app);

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

io.on('connection', async (socket) => {
  console.log('a user connected');

  socket.on('message', async (data) => {

    let ws = await wsOnInit(data);
    console.log('Received message:', ws);
    socket.emit('message', `Server Response: ${ws}`);

  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
