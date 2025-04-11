const ck = require('ckey');
const { encryptData } = require('./utils/encryption-utils');
const { words } = require('../models/index');
const { parseUserData } = require("./utils/restapis-utils");


const s3onInit = async (req, res, next) => {

    try {
        const as3wsbPlain = {
            S3_ACCESS_KEY_ID: ck.S3_ACCESS_KEY_ID,
            S3_SECRET_ACCESS_KEY: ck.S3_SECRET_ACCESS_KEY,
            S3_REGION: ck.S3_REGION,
        }
        const as3wsb = encryptData(as3wsbPlain);

        res.status(200).json({ as3wsb });
    } catch (error) {
        next(error);
    }
};

const newWordPreset = async (req, res, next) => {
    const user = parseUserData(req);
    const { list, presetTitle } = req.body;
    try {
        await words.create({
            title: presetTitle,
            words: list,
            createby: `${user.firstname} ${user.lastname}`,
            updatedby: `${user.firstname} ${user.lastname}`,
        });
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

const updateWordPreset = async (req, res, next) => {
    const user = parseUserData(req);
    const { id, title, wordlist } = req.body;
    try {
        await words.updateOne(
            { _id: id },
            {
                $set: {
                    words: wordlist,
                    title: title,
                    updatedby: `${user.firstname} ${user.lastname}`
                }
            },
        )
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}

const getWordPreset = async (req, res, next) => {
    try {
        const wordList = await words.find();
        res.status(200).json({ wordList });
    } catch (error) {
        next(error);
    }
}

const deleteWordPreset = async (req, res, next) => {
    const { id } = req.params;
    try {
        await words.deleteOne({ _id: id });
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}


module.exports = { s3onInit, newWordPreset, updateWordPreset, getWordPreset, deleteWordPreset };
