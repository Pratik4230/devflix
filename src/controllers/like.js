const { isValidObjectId } = require("mongoose");
const { Like } = require("../models/likeModel");



const toggleVideoLike = async (req,res) => {
    try {
        const {videoId} = req.params;
    
        if (!isValidObjectId(videoId)) {
            return res.send("Invalid video id")
        }
    
        const alreadyLiked = await Like.findOne({
            video: videoId,
            likedBy: req.user?._id
        });
    
        if (alreadyLiked) {
            await Like.findByIdAndDelete(alreadyLiked._id)
    
            return res.status(200).json({
                message: " unliked video",
                isLiked: false
            })
        }
    
        const like = new Like({
            video: videoId,
            likedBy: req.user?._id
        });
    
        if (!like) {
            return res.send("failed to like video please try again")
        }
    
        await like.save();
    
        return res.status(200).json({
            message: " liked vidoe",
            isLiked: true
        })
    } catch (error) {
        return res.send("ERROR likeVideo : " + error)
    }
}

const toggleCommentLike = async (req, res) => {
    try {
        const {commentId} = req.params;
    
        if (!isValidObjectId(commentId)) {
            return res.send("Invalid comment id")
        }
    
        const alreadyLiked = await Like.findOne({
            comment: commentId,
            likedBy: req.user?._id
        })
    
        if (alreadyLiked) {
            await Like.findByIdAndDelete(alreadyLiked._id);

            return res.json({
                message: " unliked comment",
                isLiked: false
            })
        }
    
        const like = new Like({
            comment: commentId,
            likedBy: req.user?._id
        })
    
        if (!like) {
            return res.send("failed to like comment please try again")
        }
    
        await like.save();

        return res.status(200).json({
            message: " liked comment",
            isLiked: true
        })
    } catch (error) {
        return res.send("ERROR likeComment : " + error)
    }
}

const togglePostLike = async (req, res) => {
    try {
        const {postId} = req.params;
    
        if (!isValidObjectId) {
            return res.send("Invalid post id")
        }
    
        const alreadyLiked = await Like.findOne({
            post: postId,
            likedBy: req.user?._id
        })
    
        if (alreadyLiked) {
            await Like.findByIdAndDelete(alreadyLiked._id)
            return res.json({
                message: " unliked post",
                isLiked: false
            })
        }
    
        const like = new Like({
            post: postId,
            likedBy: req.user?._id
        })
    
        if (!like) {
            return res.send("failed to like post please try again") 
        }

        await like.save();

        return res.status(200).json({
            message: " liked post",
            isLiked: true
        })
    } catch (error) {
        return res.send("ERROR likePost : " + error)
    }
}

module.exports={toggleVideoLike, toggleCommentLike, togglePostLike}