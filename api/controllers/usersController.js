const { users } = require("../models/index");

const getAllUsers = async (req, res, next) => {
    let user = await users.find()
    .sort({ createdAt: -1 })
        .skip(0)
        .limit(15);
    res.status(200).json(user);
}

const getUser = async (req, res, next) => {
    const {id} = req.params;
    let user = await users.find()
    .sort({ createdAt: -1 })
        .skip(0)
        .limit(15);
    res.status(200).json(id);
}

const addUser = async (req, res, next) => {
    res.status(200).json({success:true});
}
const deleteUser = async (req, res, next) => {
    res.status(200).json({success:true});
}

module.exports = {getAllUsers,getUser,addUser,deleteUser};