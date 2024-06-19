const router = require('express').Router();
const testController = require('../controllers/test.js');

router.post('/new', testController.testController);

module.exports = router;