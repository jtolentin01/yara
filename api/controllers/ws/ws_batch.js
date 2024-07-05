const { MongoClient } = require('mongodb');

let io;
let changeStream;
const RETRY_INTERVAL = 5000; 

const createChangeStream = (collection) => {
    changeStream = collection.watch();

    changeStream.on('change', (change) => {
        try {
            switch (change.operationType) {
                case 'update':
                    const updatedBatchId = change.documentKey._id; 
                    const progress = change.updateDescription.updatedFields.progress;
                    const changesObj = {
                        updatedBatchId,
                        progress,
                    };
                    console.log('Update Object:', changesObj);
                    io.emit('message', changesObj);
                    break;

                case 'insert':
                    const newDocument = change.fullDocument;
                    const insertObj = {
                        new: newDocument
                    };
                    console.log('Insert Object:', insertObj);
                    io.emit('message', insertObj);
                    break;

                default:
                    console.log('Other change detected:', change);
            }
        } catch (innerError) {
            console.error('Error handling change stream event:', innerError);
        }
    });

    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
        setTimeout(() => reestablishChangeStream(collection), RETRY_INTERVAL);
    });
};

const reestablishChangeStream = async (collection) => {
    console.log('Attempting to re-establish change stream...');
    try {
        if (changeStream) {
            await changeStream.close(); 
        }
    } catch (error) {
        console.error('Error closing existing change stream:', error);
    }
    createChangeStream(collection);
};

const initializeMongoDB = async () => {
    const uri = process.env.DB_ADDR;
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('dev-env');
    const collection = database.collection('batches');
    createChangeStream(collection);
    return client;
};

const wsBatchInit = async (socketIO) => {
    io = socketIO;

    try {
        await initializeMongoDB();
        console.log('Watching for changes...');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }

    return 'working from ws_batch.js';
};

module.exports = wsBatchInit;
