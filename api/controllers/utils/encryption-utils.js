
const CryptoJS = require('crypto-js');
const ck = require('ckey');
const secretKey = ck.ENCRYPTION_KEY;

const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

const encryptData = (data) => {
    return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        secretKey
    ).toString();
}


module.exports = { hashPassword,encryptData };
