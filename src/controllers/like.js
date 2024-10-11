const { isValidObjectId } = require("mongoose");
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
            video.likes.pull(req.user._id);  // Unlike
            await video.save();
            return res.status(200).json({
                message: "Unliked video",
                isLiked: false
            });
        }

        video.likes.push(req.user._id);  // Like
        await video.save();
        
        return res.status(200).json({
            message: "Liked video",
            isLiked: true
        });

    } catch (error) {
        console.log(error);
        
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

        const alreadyLiked = comment.likes.includes(req.user._id);

        if (alreadyLiked) {
            comment.likes.pull(req.user._id);  // Unlike
            await comment.save();
            return res.status(200).json({
                message: "Unliked comment",
                isLiked: false
            });
        }

        comment.likes.push(req.user._id);  // Like
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
            post.likes.pull(req.user._id);  // Unlike
            await post.save();
            return res.status(200).json({
                message: "Unliked post",
                isLiked: false
            });
        }

        post.likes.push(req.user._id);  // Like
        await post.save();
        
        return res.status(200).json({
            message: "Liked post",
            isLiked: true
        });

    } catch (error) {
        return res.status(500).send("ERROR togglePostLike: " + error);
    }
};

module.exports = { toggleVideoLike, toggleCommentLike, togglePostLike };
