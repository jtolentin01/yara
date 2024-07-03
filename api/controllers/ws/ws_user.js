const { users } = require('../../models/index');
let io;
const activeUsers = {};
const userConnections = {}; // Track number of connections per user

const wsUserInit = async (socketIO, data) => {
  io = socketIO;

  io.on('connection', async (socket) => {
    console.log('A user connected');
    const internalid = data.reqBody.userId;
    console.log(`User ID from request body: ${internalid}`);

    if (internalid) {
      try {
        if (!userConnections[internalid]) {
          userConnections[internalid] = 0;
        }

        userConnections[internalid]++;
        activeUsers[socket.id] = internalid;
        console.log('Current active users:', activeUsers);
        console.log('Current user connections:', userConnections);
        
        await users.findOneAndUpdate({ internalid }, { isonline: true });
        console.log(`User ${internalid} is now online`);
        socket.internalid = internalid;

        await emitOnlineUsers();

        socket.on('disconnect', async () => {
          console.log(`User ${internalid} disconnected`);
          userConnections[internalid]--;
          if (userConnections[internalid] === 0) {
            await users.findOneAndUpdate({ internalid }, { isonline: false });
          }
          delete activeUsers[socket.id];
          console.log('Current active users:', activeUsers);
          console.log('Current user connections:', userConnections);
          
          await emitOnlineUsers();
        });
      } catch (error) {
        console.error('Error updating user status to online:', error);
      }
    } else {
      console.error('No userId found in request body');
    }
  });
};

const emitOnlineUsers = async () => {
  try {
    const onlineUsers = await users.find({ isonline: true }).select('internalid username email image');
    io.emit('message', onlineUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
  }
};

module.exports = wsUserInit;
