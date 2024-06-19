const router = require('express').Router();
const {newBatch} = require('../controllers/batchController.js');

router.post('/new', newBatch);

module.exports = router;