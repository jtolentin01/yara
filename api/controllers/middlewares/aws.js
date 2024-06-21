const AWS = require('aws-sdk');

const uploadFileToS3 = async (s3Folder, file, fileName) => {    

    const S3Keys = {
        accessKeyId: process.env.S3_ACCESS_KEY_ID, 
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION, 
    }
    AWS.config.update(S3Keys);
    const s3 = new AWS.S3()

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Folder + '/' + fileName,
        Body: file,
    }

    return new Promise((resolve, reject) => {
        s3.upload(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data.Location)
            }
        })
    })

}

module.exports = {uploadFileToS3};
