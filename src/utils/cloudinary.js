const cloudinary = require('cloudinary').v2;
const fs = require('fs');



cloudinary.config({ 
    cloud_name:proces.env.CLOUDINARY_CLOUD_NAME , 
    api_key: proces.env.CLOUDINARY_API_KEY, 
    api_secret: proces.env.CLOUDINARY_API_SECRET
});

const cloudinaryUpload = async (lacalFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        const uploadResult  = await cloudinary.uploader.upload( localFilePath , {
     resource_type: "auto",
         })
     console.log("file uploaded on cloudinary URL : ", uploadResult.url);
        fs.unlinkSync(localFilePath)
        return uploadResult;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}