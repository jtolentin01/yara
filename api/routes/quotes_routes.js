const router = require('express').Router();
const {getRandomQuotes} = require('../controllers/quotesController');

router.get('/zen/random', getRandomQuotes);

module.exports = router;