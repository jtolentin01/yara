const CryptoJS = require('crypto-js');
const ck = require('ckey');
const secretKey = ck.ENCRYPTION_KEY;

const parseUserData = (req) => {
    try{
        const cookie = req.headers.cookie.replace(/^user=/, '');
        const userData = JSON.parse(decryptData(cookie,secretKey));
        return userData.data;
    }catch(error){
        return "";
    }

};

const decryptData = (encryptedData, secretKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};

module.exports = {parseUserData};


