const jsonFile = require('./detectwords.json');
const {words, connectDB} = require('../models/index');

const exec = async () => {
    await connectDB();
    try {
        for (const item of jsonFile) {
            await words.create({
                title: item.title,
                words: item.words,
                createby: `Unknown`,
                updatedby: `Unknown`,
            });
            console.log(`Inserted document with title: ${item.title}`);
        }
    } catch (error) {
        console.error(error);
    }
}

exec();
