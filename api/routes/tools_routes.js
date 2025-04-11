const router = require('express').Router();
const {getListOfTools,getListOfParsers, getListOfScrapers} = require('../controllers/indexController.js');

router.get('/list/all', getListOfTools);
router.get('/list/all/parsers', getListOfParsers);
router.get('/list/all/scrapers', getListOfScrapers);

module.exports = router;