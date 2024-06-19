const jwt = require('jsonwebtoken');

const validateRequest = (req, res, next) => {
    const secretKey = "zAzze352DfszcsGs35zx";
    const authHeader = req.headers['authorization'];
    const cookie = req.headers['cookie'];

    if (!authHeader && !cookie) {
        return res.status(401).json({ message: 'Unauthorized Access' });
    }
    else{
        next();
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
