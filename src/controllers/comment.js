const { isValidObjectId } = require("mongoose");
const { Comment } = require("../models/commentModel");
const { Video } = require("../models/videoModel");
const mongoose = require("mongoose");



const addComment = async (req,res) => {
    const {videoId} = req.params;
    const {content} = req.body;

   try {
     if(!content){
         return res.status(400).send("content is required")
     }
 
     const video = await Video.findById(videoId);
 
     if (!video) {
         return res.status(404).send("video not found")
     }
 
     const comment = new Comment({
         content: content,
         video: videoId,
         owner: req.user?._id
     })
 
     if (!comment) {
         return res.status(500).send("failed to add comment please try again")
     }
 
     await comment.save();
 
     return res.status(200).json({
         message: "comment added successfully",
         comment
     })
   } catch (error) {
     return res.status(500).send("Error accured : "+ error)
   }
}

const updateComment = async (req, res) => {
  const {commentId} = req.params;
  const {content} = req.body;

try {
      if (!isValidObjectId(commentId)) {
        return res.status(400).send("Invalid comment id")
    }
    
      if (!content) {
        return res.status(400).json({message: "Content is required"})
      }
       
      const comment = await Comment.findById(commentId);
    
      if (!comment) {
        return res.status(404).send("Comment not found")
      }
     
      if (comment.owner?.toString() !== req.user?._id.toString()) {
        return res.status(401).json({message : "only owner can update comment"})
      }
    
      const updatedComment = await Comment.findByIdAndUpdate(
        {_id: commentId},
        {
            $set:{
                content:content
            }
        },
        {new: true}
    )
    
    if (!updatedComment) {
        return res.status(500).send("failed to update comment Please try again")
    }
    
    return res.status(200).json({
        message: "comment updated",
        updatedComment
    })
} catch (error) {
    return res.status(500).send("error while updating comment  " + error)
}

}

const deleteComment = async (req, res) => {
    const {commentId} = req.params;

    try {
        if (!isValidObjectId(commentId)) {
            return res.status(400).send("Invalid comment id")
        }
    
        const comment = await Comment.findById(commentId);
    
        if (!comment) {
            return res.status(404).send("Comment not found")
        }
    
        if (comment.owner?.toString() !== req.user?._id.toString()) {
            return res.status(401).json({message: "only owner can delete this comment"})
        }
    
        const deletedComment = await Comment.findByIdAndDelete(commentId);
    
        if(!deletedComment){
            return res.status(500).send("something went wrong try again to delete")
        }
    
        return res.status(200).json({
            message: "deleted successfully",
            deletedComment
        })
    } catch (error) {
        return res.status(500).send("Error while delete comment " + error)
    }
}


const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await Video.aggregate([
      {
        $match: {
          _id:  new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "video",
          as: "comments",
        },
      },
      {
        $unwind: {
          path: "$comments",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.owner",
          foreignField: "_id",
          as: "commentor",
        },
      },
      {
        $addFields: {
          commentorChannelName: { $first: "$commentor.channelName" },
          commentorAvatar: { $first: "$commentor.avatarImage.url" },
          commentContent: "$comments.content",
          commentCreatedAt: "$comments.createdAt",
          key: "$comments._id"
        },
      },
      {
        $project: {
        _id: 0,
          key: 1,
          content: "$commentContent",
          channelName: "$commentorChannelName",
          avatar: "$commentorAvatar",
          createdAt: "$commentCreatedAt",
        },
      },
    ]);

   
    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments found for this video" });
    }

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching video comments: ", error);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports={addComment, updateComment, deleteComment, getVideoComments}