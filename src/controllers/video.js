
const { isValidObjectId } = require("mongoose");
const { Video } = require("../models/videoModel");
const { cloudinaryUpload } = require("../utils/cloudinary");
const cloudinary = require('cloudinary').v2;


const uploadVideo = async(req, res) => {

    try {
        const {title, description} = req.body;
    
        if (!(title && description)) {
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

const updateVideo = async (req, res) => {
    const { title, description } = req.body;
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        return res.send( "Invalid videoId");
    }

  
    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).send("video not found");
    }

   
    if (video.owner.toString() !== req.user._id.toString()) {
        return res.send("You can't edit this video as you are not the owner")
    }

    const thumbnailLocalPath = req.file?.path;
    let thumbnail = null;

    if (thumbnailLocalPath) {
        const thumbnailToDelete = video.thumbnail.public_id;

        thumbnail = await cloudinaryUpload(thumbnailLocalPath);
        if (!thumbnail) {
            return res.send("Thumbnail upload failed Please try again");
        }

           await cloudinary.uploader.destroy(thumbnailToDelete);
         
       
    }

    const updateFields = {};

    if (title) {
        updateFields.title = title;
    }
    if (description) {
        updateFields.description = description;
    }
    if (thumbnail) {
        updateFields.thumbnail = {
            public_id: thumbnail.public_id,
            url: thumbnail.url || thumbnail.secure_url,
        };
    }

    if (Object.keys(updateFields).length === 0) {
        return res.send("No updates provided");
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedVideo) {
        return res.send("Failed to update, please try again");
    }

    return res.status(200).json({
        message: "ideo updated successfully",
        updatedVideo

    }) 
}
    

module.exports={uploadVideo, updateVideo}