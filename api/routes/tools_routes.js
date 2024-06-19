const router = require('express').Router();
const toolController = require('../controllers/toolsController.js');

router.get('/all', toolController.getAllTools);

module.exports = router;