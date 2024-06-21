const { Timestamp } = require('bson');
const asinCheckerLiteInit = require('./toolsControllerMain/asin-checker-lite');
const { newBatchId,newTimeStamp } = require('./utils/misc-utils');
const {parseUserData} = require('./utils/restapis-utils');

const newBatch = async (req, res, next) => {
    const { tool,importName, status } = req.body;
    const user = parseUserData(req);
    console.log(user);

    try {
        switch (tool) {
            case 'asin-checker-v2':
                const batchObj = {
                    importName: importName,
                    batchId: newBatchId('ASL'),
                    requestor: user.userId,
                    requestorName: `${user.firstName} ${user.lastName}`,
                    status: status,
                    timeStamp: newTimeStamp
                }

                console.log(batchObj);
        
                await asinCheckerLiteInit(req, res, next);
                console.log('Finish Execution!');
                break;
            case 'listing-loader-v2':
                break;
        }



        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

module.exports = { newBatch };
