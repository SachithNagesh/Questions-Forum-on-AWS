var AWS = require("aws-sdk");

const s3Client = new AWS.S3();

const snsClient = new AWS.SNS();

const uploadSingleObjectParams = {
  Bucket: process.env.S3_BUCKET_NAME,
  Key: "", // pass key
  Body: null, // pass file body
};

const deleteSingleObjectParams = {
  Bucket: process.env.S3_BUCKET_NAME,
  Key: "", // pass key
};

const s3 = {};
s3.snsClient = snsClient;
s3.s3Client = s3Client;
s3.uploadSingleObjectParams = uploadSingleObjectParams;
s3.deleteSingleObjectParams = deleteSingleObjectParams;

module.exports = s3;
