const router = require('express').Router();
const {fsr} = require('../controllers/publicController.js');

router.post('/app/fsr', fsr);

module.exports = router;