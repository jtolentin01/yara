const { users } = require('../../models/index');
let io;
const onlineUsers = [];

const wsUserInit = async (socketIO, data) => {
    io = socketIO;

    io.on('connection', async (socket) => {
        const { userId: internalid } = data.reqBody;

        if (internalid) {
            try {
                await users.findOneAndUpdate({ internalid }, { isonline: true });

                if (!onlineUsers.some((user) => user.userId === internalid)) {
                    onlineUsers.push({ userId: internalid, socketId: socket.id });
                }
                io.emit("message", onlineUsers);
                await emitOnlineUsers();

                socket.on('disconnect', async () => {
                    const index = onlineUsers.findIndex((user) => user.socketId === socket.id);
                    if (index !== -1) {
                        onlineUsers.splice(index, 1);
                        io.emit("message", onlineUsers);
                        await users.findOneAndUpdate({ internalid }, { isonline: false });
                        await emitOnlineUsers();
                        socket.removeAllListeners("message");
                    }
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
        const onlineUsersList = await users.find({ isonline: true }).select('internalid username email image');
        io.emit('message', onlineUsersList);
    } catch (error) {
        console.error('Error fetching online users:', error);
    }
};

module.exports = wsUserInit;
