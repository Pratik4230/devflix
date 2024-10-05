const { isValidObjectId } = require("mongoose");
const { Comment } = require("../models/commentModel");
const { Video } = require("../models/videoModel");



const addComment = async (req,res) => {
    const {videoId} = req.params;
    const {content} = req.body;

    if(!content){
        return res.send("content is required")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        return res.send("video not found")
    }

    const comment = new Comment({
        content: content,
        video: videoId,
        owner: req.user?._id
    })
console.log(typeof(comment));

    if (!comment) {
        return res.send("failed to add comment please try again")
    }

    await comment.save();

    return res.status(200).json({
        message: "comment added successfully",
        comment
    })
}

const updateComment = async (req, res) => {
  const {commentId} = req.params;
  const {content} = req.body;

  if (!isValidObjectId(commentId)) {
    return res.send("Invalid comment id")
}

  if (!content) {
    return res.send("Content is required")
  }
   
  const comment = await Comment.findById(commentId);
console.log(typeof(comment));

  if (!comment) {
    return res.send("Comment not found")
  }
 
  if (comment.owner?.toString() !== req.user?._id.toString()) {
    return res.send("you can't edit someone else comment")
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
    return res.send("failed to update comment Please try again")
}

return res.status(200).json({
    message: "comment updated",
    updatedComment
})

}

const deleteComment = async (req, res) => {
    const {commentId} = req.params;

    if (!isValidObjectId(commentId)) {
        return res.send("Invalid comment id")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.send("Comment not found")
    }

    if (comment.owner?.toString() !== req.user?._id.toString()) {
        return res.send("only owner can delete this comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        return res.send("something went wrong try again to delete")
    }

    return res.status(200).json({
        message: "deleted successfully",
        deletedComment
    })
}


module.exports={addComment, updateComment, deleteComment}