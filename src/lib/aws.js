const {createReadStream} = require('fs');
const AWS = require('aws-sdk');

module.exports.stage = (credentials, fileLocation) => {
    const s3 = new AWS.S3({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        region: 'us-east-1'
    });
    const body = createReadStream(fileLocation);
    return s3.putObject({
        Bucket: credentials.bucket,
        Key: credentials.key,
        Body: body
    })
        .promise();
};
