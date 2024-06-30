const jwt = require("jsonwebtoken");
const { parseUserData } = require("../controllers/utils/restapis-utils");

const validateRequest = (req, res, next) => {
  const cookie = req.headers["cookie"];

  if (!cookie) {
    return res.status(401).json({ message: "Unauthorized Access" });
  } else {
    // const validateToken = jwt.verify('123',key);
    // if(validateToken){
    next();
    // }
    // else{
    //     return res.status(401).json({ message: 'Unauthorized Access' });
    // }
  }

  // try {
  //     if (authHeader) {
  //         // Extract token from Authorization header (Bearer <token>)
  //         const token = authHeader.split(' ')[1];
  //         const decoded = jwt.verify(token, secretKey);
  //         req.user = decoded; // Attach decoded user information to request object
  //     } else if (cookie) {
  //         // Handle cookie validation if necessary
  //         // Example: const userData = validateCookie(cookie);
  //         // if (userData) {
  //         //     req.user = userData;
  //         // }
  //     }
  //     next();
  // } catch (error) {
  //     return res.status(401).json({ message: 'Unauthorized Access' });
  // }
};

module.exports = validateRequest;
