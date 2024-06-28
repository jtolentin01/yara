const { MongoClient } = require('mongodb');

let io;

const wsBatchInit = async (socketIO) => {
    io = socketIO; // Initialize socket.io instance

    try {
        const uri = process.env.DB_ADDR;
        const client = new MongoClient(uri);

        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('dev-env');
        const collection = database.collection('batches'); 
        const changeStream = collection.watch();

        changeStream.on('change', (change) => {
            switch (change.operationType) {
                case 'insert':
                    console.log('Document inserted:', change.fullDocument);
                    if (io) {
                        
                        io.emit('batchUpdated', { operationType: 'insert', document: change.fullDocument });
                    }
                    return change.fullDocument;
                case 'update':
                    const updatedBatchId = change.documentKey;
                    const progress = change.updateDescription.updatedFields.progress;
                    const changesObj = {
                        updatedBatchId,
                        progress
                    };
                    console.log(`Document updated with batchId ${updatedBatchId}:`);
                    console.log('Update Object:', changesObj);
                    if (io) {
                        console.log('io emit working!');
                        io.emit('message', changesObj);
                    }
                    return changesObj;
                case 'delete':
                    console.log('Document deleted:', change.documentKey);
                    if (io) {
                        io.emit('message', { operationType: 'delete', documentKey: change.documentKey });
                    }
                    return change.documentKey;
                default:
                    console.log('Other change detected:', change);
            }
        });

        console.log('Watching for changes...');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }


    
    return 'working from ws_batch.js'
    

    
};

module.exports = wsBatchInit;
