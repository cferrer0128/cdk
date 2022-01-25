
const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucketName = process.env.BUCKET;
exports.main = async function(event,context){
    try{
        console.log('Initiated Lambda');
        const data = await s3.listObjectsV2({Bucket:bucketName}).promise();
        console.log(data);
    }
    catch(error){
        return {
            statusCode:400,
            headers:{},
            body:JSON.stringify('Error 400')
        }
    }
}