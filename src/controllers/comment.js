const { isValidObjectId } = require("mongoose");
const { Comment } = require("../models/commentModel");
const { Video } = require("../models/videoModel");



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
        return res.status(400).send("Content is required")
      }
       
      const comment = await Comment.findById(commentId);
    
      if (!comment) {
        return res.status(404).send("Comment not found")
      }
     
      if (comment.owner?.toString() !== req.user?._id.toString()) {
        return res.status(401).send("you can't edit someone else comment")
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
            return res.status(401).send("only owner can delete this comment")
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


module.exports={addComment, updateComment, deleteComment}