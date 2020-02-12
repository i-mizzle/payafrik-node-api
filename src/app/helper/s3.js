const multer  = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const config = require("config");

const s3 = new AWS.S3({
    accessKeyId: config.awsS3.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.awsS3.AWS_SECRET_ACCESS_KEY
});

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: 'payafrik-user-kyc-files',
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname})
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  })
});

module.exports = {
    uploadS3: uploadS3,
};