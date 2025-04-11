const asicsInit = require('./asics-b2b');
const seikoPubInit = require('./seiko-pub');
const sauconyInit = require('./saucony-b2b');
const hhsInit = require('./hhs-b2b');
const silverJeansInit = require('./silver-jeans');

const scraperInit = async (req, res, next, batchId) => {
    const { scraper } = req.body;
    switch (scraper) {
        case 'asics-b2b':
            await asicsInit(req, res, next, batchId);
            break;
        case 'seiko-public':
            await seikoPubInit(req, res, next, batchId);
            break;
        case 'saucony-b2b':
            await sauconyInit(req, res, next, batchId);
            break;
        case 'hhs-b2b':
            await hhsInit(req, res, next, batchId, 'hhs');
            break;
        case 'hhw-b2b':
            await hhsInit(req, res, next, batchId, 'hhw');
            break;
        case 'silver-b2b':
            await silverJeansInit(req, res, next, batchId, 'silver');
            break;
        case 'jag-b2b':
            await silverJeansInit(req, res, next, batchId, 'jag');
            break;
        default:
            return res.status(200).json({ message: 'unknown error' });
    }

}
module.exports = scraperInit;