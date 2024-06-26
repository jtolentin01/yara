const router = require('express').Router();
const {loginInit} = require('../controllers/authController');

router.post('/login', loginInit);

module.exports = router;