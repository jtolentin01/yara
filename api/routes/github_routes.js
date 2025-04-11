const router = require('express').Router();
const releaseNotesInit = require('../controllers/releaseNotes');

router.get('/get/commits', releaseNotesInit);


module.exports = router;