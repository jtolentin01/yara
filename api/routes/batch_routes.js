const router = require('express').Router();
const {newBatch,getBatches, deleteBatches} = require('../controllers/batchController.js');

router.post('/new', newBatch);
router.get('/list', getBatches);
router.delete('/delete/:batchid', deleteBatches);

module.exports = router;