const router = require('express').Router();
const {getListOfTools} = require('../controllers/indexController.js');

router.get('/list/all', getListOfTools);

module.exports = router;