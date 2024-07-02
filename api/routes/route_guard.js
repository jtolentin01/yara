const jwt = require("jsonwebtoken");
const ck = require('ckey');
const secretKey = ck.ENCRYPTION_KEY;
const { parseUserData } = require("../controllers/utils/restapis-utils");

const validateRequest = (req, res, next) => {
  const cookie = req.headers["cookie"];
  const user = parseUserData(req);

  if (!cookie) {
    return res.status(401).json({ message: "Unauthorized Access" });
  } else {

    const validateToken = jwt.verify(user.authorization,secretKey);
    if(validateToken){
    next();
    }
    else{
        return res.status(401).json({ message: 'Unauthorized Access' });
    }
  }
};


module.exports = validateRequest;
