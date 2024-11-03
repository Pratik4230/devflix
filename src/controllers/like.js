const { isValidObjectId, mongoose } = require("mongoose");
const {Video} = require("../models/videoModel");
const {Comment} = require("../models/commentModel");
const {Post} = require("../models/postModel");

const toggleVideoLike = async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!isValidObjectId(videoId)) {
            return res.status(400).send("Invalid video id");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).send("Video not found");
        }

        const alreadyLiked = video.likes.includes(req.user?._id);

        if (alreadyLiked) {
            video.likes.pull(req.user._id); 
            await video.save();
            return res.status(200).json({
                message: "Unliked video",
                isLiked: false
            });
        }

        video.likes.push(req.user._id);  
        await video.save();
        
        return res.status(200).json({
            message: "Liked video",
            isLiked: true
        });

    } catch (error) {
        console.log(error.message);
        
        return res.status(500).send("ERROR toggleVideoLike: " + error);
    }
};

const toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!isValidObjectId(commentId)) {
            return res.status(400).send("Invalid comment id");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send("Comment not found");
        }

        const alreadyLiked = comment.likes.includes(req.user?._id);

        if (alreadyLiked) {
            comment.likes.pull(req.user?._id);  
            await comment.save();
            return res.status(200).json({
                message: "Unliked comment",
                isLiked: false
            });
        }

        comment.likes.push(req.user?._id);  
        await comment.save();
        
        return res.status(200).json({
            message: "Liked comment",
            isLiked: true
        });

    } catch (error) {
        return res.status(500).send("ERROR toggleCommentLike: " + error);
    }
};

const togglePostLike = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!isValidObjectId(postId)) {
            return res.status(400).send("Invalid post id");
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        const alreadyLiked = post.likes.includes(req.user._id);

        if (alreadyLiked) {
            post.likes.pull(req.user._id);  
            await post.save();
            return res.status(200).json({
                message: "Unliked post",
                isLiked: false
            });
        }

        post.likes.push(req.user._id); 
        await post.save();
        
        return res.status(200).json({
            message: "Liked post",
            isLiked: true
        });

    } catch (error) {
        return res.status(500).send("ERROR togglePostLike: " + error);
    }
};

const getLikedVideos = async (req, res) => {
    try {
        const userId = req.user._id; 
    
        const likedVideos = await Video.aggregate([
  
            {
              $match: {
                likes : { $in : [new mongoose.Types.ObjectId(userId)]},
                isPublished : true,
              }
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
                              description: 1,
                              views: 1, 
                             duration: 1, 
                              createdAt: 1, 
                              isPublished: 1,
                              "ownerDetails.channelName": 1,
                              "ownerDetails.avatarImage.url": 1,
                            },
                          },
          ]);
       
        
        if (likedVideos.length === 0) {
          return res.status(204).json({ message: "You have not liked any video", likedVideos });
        }

        return res.status(200).json({
            message: "success",
            data: likedVideos});
            
      } catch (error) {
       console.log("likedvideos err", error.message);
       
        return res.status(500).json({ message: "Server error" });
      }
}

module.exports = { toggleVideoLike, toggleCommentLike, togglePostLike, getLikedVideos };
