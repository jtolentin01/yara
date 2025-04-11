const { users } = require("../models/index");
const ck = require('ckey');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const key = ck.ENCRYPTION_KEY;
const { hashPassword } = require("./utils/encryption-utils");



const loginInit = async (req, res, next) => {
  try {
    const pw = hashPassword(req.body.password);
    const query = {
      $and: [{ email: req.body.email }, { password: pw }, { isactive: true }],
    };
    const userExec = await users.findOne(query);
    if (userExec) {
      const token = jwt.sign({ id: userExec.internalid }, key, {
        expiresIn: "48h",
      });

      const user = {
        _id: userExec._id,
        id: userExec.internalid,
        firstname: userExec.firstname,
        lastname: userExec.lastname,
        email: userExec.email,
        accesslevel: userExec.accesslevel,
        profile: userExec.image,
        authorization: token,
        middlename: userExec.middlename,
        role: userExec.role,
        department: userExec.department,
        active: userExec.isactive,
        createddate: userExec.createdAt
      };

      if (req.body.password === ck.PW_DEFAULT) {
        res.status(200).json({ user, secureAccess:false });
      }
      else {
        res.status(200).json({user});
      }
    }
    else {
      res.status(200).json({message: "Access Denied"});
    }



  } catch (error) {
    next(error);
  }
};


module.exports = { loginInit };
