const { users } = require("../models/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const key = process.env.ENCRYPTION_KEY;



const loginInit = async (req, res, next) => {
  try {
    const query = {
      $and: [{ email: req.body.email }, { password: req.body.password }],
    };

    const userExec = await users.findOne(query);
    const token = jwt.sign({ id: userExec.internalid }, key, {
      expiresIn: "1h",
    });

    const user = {
      id: userExec.internalid,
      firstname: userExec.firstname,
      lastname: userExec.lastname,
      email: userExec.email,
      accesslevel: userExec.accesslevel,
      profile: userExec.image,
      authorization: token
    };

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { loginInit };
