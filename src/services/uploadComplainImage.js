// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"); 
// const multer = require("multer");

// // Configure Multer for file uploads
// const storage = multer.memoryStorage();
// // const upload = multer({ storage: storage });

// const uploadComplainImage = async (file) => {
//     // console.log("file name",file);


//     const s3 = new S3Client({
//       region: process.env.DO_SPACES_REGION,
//       endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
//       credentials: {
//         accessKeyId: process.env.DO_SPACES_KEY,
//         secretAccessKey: process.env.DO_SPACES_SECRET
//       }
//     });
  
  
//     // Generate a timestamp
//     const timestamp = new Date().toISOString().replace(/[:\-T]/g, '').slice(0, 15); // YYYYMMDDHHMMSS
  
//     const fileExtension = file.originalname.split('.').pop();
//     const fileKey = `${file.originalname.split('.').slice(0, -1).join('.')}_${timestamp}${fileExtension}`;
//     console.log("Buffer size:", file.buffer);

//     const params = {
//       Bucket: process.env.DO_SPACES_BUCKET,
//       Key: fileKey,
//       Body: file.buffer,
//       ACL: 'public-read',
//       ContentType: file.mimetype
//     };
  
//     console.log("Uploading file to S3 with key:", fileKey);
  
//     try {
//      const params_upload =  await s3.send(new PutObjectCommand(params));
//      console.log("params_upload",params_upload)
//       const fileUrl = `https://${process.env.SPACE_NAME}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileKey}`;
//       console.log("File uploaded to:", fileUrl);
//       return fileUrl;
//     } catch (error) {
//       console.error("Error uploading file to S3:", error); // Log any errors during upload
//       throw new Error('Error uploading file to S3');
//     }
//   };
// // export default uploadFileToS3;

// module.exports = uploadComplainImage;