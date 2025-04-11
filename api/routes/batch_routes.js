const router = require('express').Router();
const {newBatch,getBatches, deleteBatches, resubmitBatch} = require('../controllers/batchController.js');
const {newRequest,getParserBatches, deleteParserBatches} = require('../controllers/parserController.js');

router.post('/new', newBatch);
router.post('/resubmit',resubmitBatch)
router.get('/list', getBatches);
router.delete('/delete/:batchid', deleteBatches);

router.get('/list/parser/batches', getParserBatches);
router.post('/new/parser', newRequest);
router.delete('/delete/parser/:batchid', deleteParserBatches);

module.exports = router;