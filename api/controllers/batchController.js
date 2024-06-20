const asinCheckerLiteInit = require('./toolsControllerMain/asin-checker-lite');

const newBatch = async (req, res, next) => {
    try {
        const { tool } = req.body;
        switch(tool){
            case 'asin-checker-v2':
                await asinCheckerLiteInit(req, res, next);
                break;
            case 'listing-loader-v2':
                break;    
        }

        
        
        res.status(200).json({ success: true});
    } catch (error) {
        next(error);
    }
}

module.exports = { newBatch };
