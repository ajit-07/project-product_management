import aws from 'aws-sdk';

// aws.config.update({
//     accessKeyId: "AKIAY3L35MCRZNIRGT6N",
//     secretAccessKey: "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",
//     region: "ap-south-1"
// })

// let uploadFile = async (file) => {
//     return new Promise((resolve, reject) => {

//         let s3 = new aws.S3({ apiVersion: '2006-03-01' });

//         var uploadParams = {
//             ACL: "public-read",
//             Bucket: "classroom-training-bucket",
//             Key: "abc/" + file.originalname,
//             Body: file.buffer
//         }

//         s3.upload(uploadParams, (err, data) => {
//             if (err)
//                 return reject({ "error": err })

//             console.log(data)
//             console.log("file uploaded succesfully")
//             return resolve(data.Location)
//         })

//     })
// }

// const myAws = async (req, res) => {
//     try {
//         let files = req.files
//         if (files && files.length > 0) {
//             let uploadedFileURL = await uploadFile(files[0])
//             res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
//         }
//         else {
//             res.status(400).send({ msg: "No file found" })
//         }
//     }
//     catch (err) {
//         res.status(500).send({ msg: err })
//     }
// }





aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise( (resolve, reject) => {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); 
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "group1project/" + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams,  (err, data) => {
            if (err) {
                return reject({ "error": err })
            }
            console.log("file uploaded successfully")
            return resolve(data.Location)
        })

    })
}

export { uploadFile }
