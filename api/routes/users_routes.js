const router = require('express').Router();
const {getAllUsers,getUser, addUser, deleteUser} = require('../controllers/usersController.js');

router.get('/all', getAllUsers);
router.get('/user/:id', getUser);
router.post('/new', addUser);
router.delete('/delete/:id', deleteUser);

module.exports = router;