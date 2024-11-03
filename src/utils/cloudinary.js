const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config()



cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUpload = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        const uploadResult  = await cloudinary.uploader.upload( localFilePath , {
     resource_type: "auto",
         })
     console.log("file uploaded on cloudinary URL  ");
        
     fs.unlink(localFilePath , (error) =>{
        if (error) {
            console.warn("Error deleting local file", error);
        }
     })
        return uploadResult;

    } catch (error) {
        fs.unlink(localFilePath, (err) => {
            if (err) {
                
                console.error("Error deleting local file after failure", err);
            }
        });

        return null;
    }
}

const cloudinaryDelete = async (public_id, resource_type="image") => {
    try {
        if (!public_id) return null;

        
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        });
    } catch (error) {
        console.log("delete on cloudinary failed", error);
        return error;
        
    }
};

module.exports={cloudinaryUpload, cloudinaryDelete}