const { MongoClient } = require('mongodb');

let io;
let changeStream;
let client;
let initialized = false;
const RETRY_INTERVAL = 10000;

const createChangeStream = (collection) => {
    if (changeStream) {
        changeStream.close(); 
    }

    changeStream = collection.watch([], { batchSize: 10 });

    changeStream.on('change', (change) => {
        try {
            switch (change.operationType) {
                case 'update':
                    const updatedBatchId = change.documentKey._id;
                    const progress = change.updateDescription.updatedFields.progress;
                    io.emit('message', { updatedBatchId, progress });
                    break;

                case 'insert':
                    const newDocument = change.fullDocument;
                    io.emit('message', { new: newDocument });
                    break;

                default:
                    break;
            }
        } catch (innerError) {
            console.error('Error handling change stream event:', innerError);
        }
    });

    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
        setTimeout(() => reestablishChangeStream(), RETRY_INTERVAL);
    });
};

const reestablishChangeStream = async () => {
    if (client && client.isConnected()) {
        console.log('Attempting to re-establish change stream...');
        try {
            if (changeStream) {
                await changeStream.close();
            }
            const database = client.db(process.env.DB_ENV);
            const collection = database.collection('batches');
            createChangeStream(collection);
        } catch (error) {
            console.error('Error re-establishing change stream:', error);
        }
    } else {
        console.error('Client not connected. Cannot re-establish change stream.');
    }
};

const initializeMongoDB = async () => {
    const uri = process.env.DB_ADDR;
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB WS');
    const database = client.db(process.env.DB_ENV);
    const collection = database.collection('batches');
    createChangeStream(collection);
};

const closeConnection = async () => {
    console.log('Closing MongoDB connection and change stream...');
    if (changeStream) {
        await changeStream.close();
        changeStream = null;
    }
    if (client) {
        await client.close();
        client = null;
        console.log('MongoDB connection closed');
    }
    initialized = false;
};

const wsBatchInit = async (socketIO) => {
    if (!initialized) {
        io = socketIO;
        try {
            await initializeMongoDB();
            console.log('MongoDB and change stream initialized successfully');
            initialized = true;
        } catch (error) {
            console.error('Error initializing MongoDB and change stream:', error);
        }
    }
};

wsBatchInit.closeConnection = closeConnection;

module.exports = wsBatchInit;
