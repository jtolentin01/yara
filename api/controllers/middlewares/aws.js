const AWS = require('aws-sdk');

const S3Keys = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
}
AWS.config.update(S3Keys);
const s3 = new AWS.S3()

const uploadFileToS3 = async (s3Folder, file, fileName) => {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Folder + '/' + fileName,
        Body: file,
    }

    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data.Location)
            }
        })
    })

}

const saveBufferToS3 = ({ keyName, contentType, base64 }) =>
    new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: process.env.S3_BUCKET,
                Body: Buffer.from(base64, 'base64'),
                Key: keyName,
                ContentEncoding: 'base64',
                ContentType: contentType
            };

            const response = await s3.upload(params).promise();
            resolve(response);
        } catch (error) {
            reject(error);
        }
    });

const readFileFromS3 = (s3Folder, fileName) =>
    new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: s3Folder + '/' + fileName,
            };
            const stream = s3.getObject(params).createReadStream();
            resolve(stream);
        } catch (error) {
            reject(error);
        }
    });

module.exports = { uploadFileToS3, readFileFromS3,saveBufferToS3 };
