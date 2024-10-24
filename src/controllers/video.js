
const { isValidObjectId } = require("mongoose");
const { Video } = require("../models/videoModel");
const { cloudinaryUpload, cloudinaryDelete } = require("../utils/cloudinary");
const mongoose = require("mongoose");
const { Subscription } = require("../models/subscriptionModel");


const uploadVideo = async(req, res) => {

    try {
        const {title, description} = req.body;
    
        if (!(title && description)) {
            return res.status(400).send("All fields are required")
        }
    
        const videoFilePath = req.files?.video[0].path;
        const thumbnailFilePath = req.files?.thumbnail[0].path;
    
        if (!videoFilePath) {
            return res.status(400).send("video path is required")
        }
        if (!thumbnailFilePath) {
            return res.status(400).send("thumbnail path is required")
        }
    
      const videoCloud =  await cloudinaryUpload(videoFilePath);
       const thumbnailCloud = await cloudinaryUpload(thumbnailFilePath);
    
       if (!videoCloud) {
        return res.status(500).send("Something went wrong while uploading video Please try again")
       }
       if (!thumbnailCloud) {
        return res.status(500).send("Something went wrong while uploading video Please try again")
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
        return res.status(500).send("videoUpload failed please try again !!!");
    }
    
    return res
        .status(200)
        .json({
       message: "Video uploaded successfully",
       video});
    } catch (error) {
        
        res.status(500).send("ERROR uploading video : " + error)
        
    }
}

const updateVideo = async (req, res) => {
   try {
     const { title, description } = req.body;
     const { videoId } = req.params;
 
     if (!isValidObjectId(videoId)) {
         return res.status(400).send( "Invalid videoId");
     }
 
   
     const video = await Video.findById(videoId);
     if (!video) {
         return res.status(404).send("video not found");
     }
 
    
     if (video.owner.toString() !== req.user._id.toString()) {
         return res.status(401).send("You can't edit this video as you are not the owner")
     }
 
     const thumbnailLocalPath = req.file?.path;
     let thumbnail = null;
 
     if (thumbnailLocalPath) {
         const thumbnailToDelete = video.thumbnail.public_id;
 
         thumbnail = await cloudinaryUpload(thumbnailLocalPath);
         if (!thumbnail) {
             return res.status(500).send("Thumbnail upload failed Please try again");
         }
 
         cloudinaryDelete(thumbnailToDelete)

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
         return res.status(400).send("No updates provided");
     }
 
 
     const updatedVideo = await Video.findByIdAndUpdate(
         videoId,
         { $set: updateFields },
         { new: true }
     );
 
     if (!updatedVideo) {
         return res.status(500).send("Failed to update, please try again");
     }
 
     return res.status(200).json({
         message: "ideo updated successfully",
         updatedVideo
 
     }) 
   } catch (error) {
    
        return res.status(500).send("Error updating video details : " + error)
   }
}
  

const deleteVideo = async (req, res) =>{
    try {
        const {videoId} = req.params;
    
        if (!isValidObjectId(videoId)) {
            return res.status(400).send("invalid video id")
        }
    
        const video = await Video.findById(videoId);
    console.log("video" , video);
    
        if (!video) {
            return res.status(404).send("Video not found")
        }
    
        if (video.owner?.toString() !== req.user?._id.toString()) {
            return res.status(401).send("only owner can delete video")
        }
    
      const dele =  await Video.findByIdAndDelete(video?._id);

      if (!dele) {
        return res.status(500).send("something went wrong while deleting")
      }
      
    cloudinaryDelete(video.video.public_id, "video")
    cloudinaryDelete(video.thumbnail.public_id)
      
      return res.status(200).send("success delete")
    } catch (error) {
        
        res.status(500).send("ERROR deleting video : " + error)
    }
}

const toggleVideoPublish = async (req,res) => {
    try {
        const {videoId} = req.params;
    
        if (!isValidObjectId(videoId)) {
            return res.status(404).send("invalid video id")
        }
    
        const video = await Video.findById(videoId);
    
        if (!video) {
            return res.status(404).send("Video doen't exists")
        }
    
        if(video.owner?.toString() !== req.user?._id.toString()){
            return res.status(401).send("Unauthorized access")
        }
    
        const toggled = await Video.findByIdAndUpdate({
            _id: videoId
        }, {
           $set:{
            isPublished: !video.isPublished
           }
        },
        {new:true}
    )
    
    if (!toggled) {
        return res.status(500).send("Failed to toggle please try again")
    }
    
    return res.status(200).json({message:"success", toggled})
    } catch (error) {
    
        return res.status(500).send("ERROR toggle video : " + error)
    }
}

const getVideoById = async (req,res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;

        const video = await Video.aggregate([
            
                {
                  $match: { _id: new mongoose.Types.ObjectId(videoId)} 
                },
                {
                  $lookup: {
                    from: "users", 
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                  },
                },
                { $unwind: "$ownerDetails" }, 
                {
                  $addFields: {
                    likes: { $ifNull: ["$likes", []] }, 
                  },
                },
                {
                  $project: {
                    _id: 1,
                    video :"$video.url", 
                    thumbnail:"$thumbnail.url", 
                    title: 1, 
                    description: 1, 
                    views: 1, 
                    duration: 1, 
                    createdAt: 1, 
                    channelId: "$ownerDetails._id",
                    owner: "$ownerDetails.channelName",
                    ownerAvatar:"$ownerDetails.avatarImage.url",
                    likes: { $size: "$likes" }, 
                  },
                },
              
        ]);

        if (!video || video.length == 0) {
            return res.status(404).json({ message: "Video not found" });
        }

        const isSubscribed  = await Subscription.exists({
          subscriber: userId,
          channel: video[0].channelId,
        });

        const videoWithSubscription = {
          ...video[0],
          isSubscribed: !!isSubscribed, 
        };

        res.status(200).json(videoWithSubscription);

    } catch (error) {
            console.error("Error fetching video by ID: ", error);
    res.status(500).json({ message: "Server error" });
    }
}

const getVideosByChannel = async (req,res) => {
    
    try {
        const channelId = req.params.channelId;


        const videos = await Video.aggregate([
            
                {
                  $match: { owner: new mongoose.Types.ObjectId(channelId)}
                },
                {
                  $lookup: {
                    from: "users", 
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                  },
                },
                { $unwind: "$ownerDetails" }, 
    
                {
                  $project: {
                    _id: 1,
                    "thumbnail.url": 1, 
                    title: 1, 
                    views: 1, 
                   duration: 1, 
                    createdAt: 1, 
                    "ownerDetails.channelName": 1,
                    "ownerDetails.avatarImage.url": 1,
                  },
                },

              
        ])

        if (!videos || videos.length == 0) {
            return res.status(404).json({ message: "No videos found for this channel" }); 
        }

       return res.status(200).json(videos);
       
        
    } catch (error) { 
        console.error("Error fetching videos for channel: ", error);
    res.status(500).json({ message: "Server error" });
    }
}

const getFeed = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 15; 
      const skip = (page - 1) * limit;
  
      const videos = await Video.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails"
          }
        },
        {
          $unwind: "$ownerDetails"
        },
        {
          $project: {
            "video.url": 1,
            "thumbnail.url": 1,
            title: 1,
            description: 1,
            views: 1,
            duration: 1,
            "ownerDetails.channelName": 1,
            "ownerDetails.avatarImage.url": 1,
            createdAt: 1
          }
        },
        {
          $sort: { createdAt: -1 } 
        },
        {
          $skip: skip 
        },
        {
          $limit: limit 
        }
      ]);
  
      const totalVideos = await Video.countDocuments(); // Total number of videos for pagination metadata
      const totalPages = Math.ceil(totalVideos / limit);
  
      res.status(200).json({
        videos,
        currentPage: page,
        totalPages,
        totalVideos
      });
    } catch (error) {
        console.log(error);
        
      res.status(500).json({ message: "Server hii Error", error });
    }
  };
  
module.exports={uploadVideo, updateVideo, deleteVideo, toggleVideoPublish, getVideoById, getVideosByChannel, getFeed}