const { users } = require('../../models/index');
let io;

const wsUserInit = async (socketIO, data) => {
    io = socketIO;

    io.on('connection', async (socket) => {
        console.log('Received from ws user controller');
        const internalid = data.reqBody.userId;
        console.log(internalid);

        if (internalid) {
            try {
                await users.findOneAndUpdate({ internalid }, { isonline: true });

                console.log(`User ${internalid} is now online`);

                socket.internalid = internalid;

                socket.on('disconnect', async () => {
                    const { internalid } = socket;
                    await users.findOneAndUpdate({ internalid }, { isonline: false });
                    console.log(`User ${internalid} is now offline`);
                });
            } catch (error) {
                console.error('Error updating user status to online:', error);
            }
        }
    });

    const changeStream = users.watch();

    changeStream.on('change', async (change) => {
        if (change.operationType === 'update' || change.operationType === 'insert' || change.operationType === 'delete') {
            try {
                let activeUsers = await users.find({ isonline: true });
                let activeUsersObj = activeUsers.map(user => ({
                    id: user.internalid,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    image: user.image
                }));

                io.emit('message', { active: activeUsersObj });
            } catch (error) {
                console.error('Error fetching active users:', error);
            }
        }
    });

    return 'Connected';
};

module.exports = wsUserInit;
