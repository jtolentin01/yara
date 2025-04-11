const router = require('express').Router();
const {getAllUsers,getUser, addUser, deleteUser, updateUser,updateUserPw,updateUserProfile} = require('../controllers/usersController.js');

router.get('/all', getAllUsers);
router.get('/user/:id', getUser);
router.post('/new', addUser);
router.post('/update/:id', updateUser);
router.post('/update/pw/:id', updateUserPw);
router.post('/update/profile/:id', updateUserProfile);
router.delete('/delete/:id', deleteUser);


module.exports = router;