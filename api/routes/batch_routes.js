const router = require('express').Router();
const {newBatch,getBatches} = require('../controllers/batchController.js');

router.post('/new', newBatch);
router.get('/list', getBatches);

module.exports = router;