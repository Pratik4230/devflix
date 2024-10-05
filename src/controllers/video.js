const { Video } = require("../models/videoModel");
const { cloudinaryUpload } = require("../utils/cloudinary");



const uploadVideo = async(req, res) => {

    try {
        const {title, description} = req.body;
    
        if (!(title || description)) {
            return res.send("All fields are required")
        }
    
        const videoFilePath = req.files?.video[0].path;
        const thumbnailFilePath = req.files?.thumbnail[0].path;
    
        if (!videoFilePath) {
            return res.send("video path is required")
        }
        if (!thumbnailFilePath) {
            return res.send("thumbnail path is required")
        }
    
      const videoCloud =  await cloudinaryUpload(videoFilePath);
       const thumbnailCloud = await cloudinaryUpload(thumbnailFilePath);
    
       if (!videoCloud) {
        return res.send("Something went wrong while uploading video Please try again")
       }
       if (!thumbnailCloud) {
        return res.send("Something went wrong while uploading video Please try again")
       }
    
       const video = new Video({
        video: {
            url: videoCloud.url || videoCloud.secure_url,
            public_id: videoCloud.public_id
        },
    
        thumbnail: {
            url: thumbnailCloud.url || videoCloud.secure_url,
            public_id: thumbnailCloud.public_id
        },
    
        title: title,
        description: description,
    
        duration: videoCloud.duration,
        owner: req.user?._id,
        isPublished: true
       });
    
       await video.save()
    
       const uploadedVideo = await Video.findById(video._id)
    
       if (!uploadedVideo) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }
    
    return res
        .status(200)
        .json({
       message: "Video uploaded successfully",
       video});
    } catch (error) {
        console.log("ERROR uploading video", error);
        res.send("ERROR uploading video : " + error)
        
    }
}

module.exports={uploadVideo}