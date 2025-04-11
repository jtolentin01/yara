const router = require('express').Router();
const {newChat,chatOnExec,chatHistory,getUserChatId,deleteConversation} = require('../controllers/chatController');

router.post('/ai/new', newChat);
router.post('/ai/:id', chatOnExec);
router.get('/ai/:id', chatHistory);
router.get('/ai', getUserChatId);
router.delete('/ai/:id', deleteConversation);

module.exports = router;