const CryptoJS = require('crypto-js');
const secretKey = 'zAzze352DfszcsGs35zx'; 

const parseUserData = (req) => {
    const cookie = req.headers.cookie.replace(/^user=/, '')
    const userData = JSON.parse(decryptData(cookie,secretKey));
    return userData.data;
};

const decryptData = (encryptedData, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};

module.exports = {parseUserData};


