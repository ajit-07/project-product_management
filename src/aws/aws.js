import aws from 'aws-sdk';

//Configuration of the AWS S3

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

//this function will help us to upload the file to AWS s3

let uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, (err, data) => {
            if (err) {
                return reject({ "error": err })
            }
            //console.log(data)
            console.log("file uploaded successfully")
            //console.log(data.Location)
            return resolve(data.Location)
        })

    })
}

export { uploadFile }
