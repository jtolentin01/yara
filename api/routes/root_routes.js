const router = require('express').Router();
const {s3onInit,newWordPreset,updateWordPreset,getWordPreset,deleteWordPreset} = require('../controllers/rootController');

router.get('/as3wsb', s3onInit);

router.post('/new/preset/word', newWordPreset);
router.post('/update/preset/word', updateWordPreset);
router.get('/get/preset/word', getWordPreset);
router.delete('/delete/preset/word/:id', deleteWordPreset);

module.exports = router;