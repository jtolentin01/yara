const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./api/routes/index');
const models = require('./api/models/index');
const wsBatchInit = require('./api/controllers/ws/ws_batch');
const key = require('ckey');
const path = require('path');
const Sentry = require("@sentry/node");
const app = express();
const port = process.env.PORT || 5000;
const clients = new Map();
const server = http.createServer(app);
require("./instrument.js");
const io = new Server(server, {
  cors: {
    origin: key.PROD_URL ? key.PROD_URL : key.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(express.static(path.join(__dirname, 'client/dist/listings-alternative/browser')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(cors());
Sentry.setupExpressErrorHandler(app);
routes.initRoutes({ app });

models.connectDB();

let activeClients = 0;
const MAX_CONNECTION_DURATION = 60 * 60 * 1000;

io.on('connection', async (socket) => {
  activeClients++;

  const connectTime = Date.now();
  const disconnectTimer = setTimeout(() => {
    socket.disconnect(true);
  }, MAX_CONNECTION_DURATION);

  if (activeClients === 1) {
    await wsBatchInit(io);
  }

  const broadcastActiveClients = () => {
    io.emit('activeclient', Array.from(clients.values()));
  };

  socket.on('clientdetails', (details) => {
    if (details.internalId) {
      let existingClient = null;
      clients.forEach((value, key) => {
        if (value.internalId === details.internalId) {
          existingClient = key;
        }
      });

      if (existingClient) {
        io.sockets.sockets.get(existingClient)?.disconnect(true);
        clients.delete(existingClient);
      }

      clients.set(socket.id, {
        ...details,
        socketId: socket.id
      });
    }

    broadcastActiveClients();
  });

  socket.on('disconnect', async () => {
    activeClients--;

    let clientKey = null;
    clients.forEach((value, key) => {
      if (value.socketId === socket.id) {
        clientKey = key;
      }
    });

    if (clientKey) {
      clients.delete(clientKey);
    }

    console.log(`Client disconnected, active clients: ${activeClients}`);

    const disconnectTime = Date.now();
    const connectionDuration = (disconnectTime - connectTime) / 1000;
    console.log(`Client was connected for ${connectionDuration} seconds`);

    clearTimeout(disconnectTimer);

    broadcastActiveClients();

    if (activeClients === 0) {
      await wsBatchInit.closeConnection();
    }
  });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/listings-alternative/browser/index.html'));
});

server.listen(port, () => console.log(`Server running on port ${port}`));

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong!');
// });