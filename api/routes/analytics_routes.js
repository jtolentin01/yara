const router = require('express').Router();
const {analyticsInit} = require('../controllers/analyticsController');

router.get('/main', analyticsInit);

module.exports = router;