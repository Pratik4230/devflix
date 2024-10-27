const {mongoose } = require("mongoose");
const { Post } = require("../models/postModel");

const createPost = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Login first");
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).send("content is required");
    }

    const post = new Post({
      content: content,
      owner: user._id,
    });

    await post.save();

    return res.status(201).json({
      message: "Post successfully created !!!",
      data: post,
    });
  } catch (error) {
    

    return res.status(500).send("ERROR : " + error);
  }
};

const updatePost = async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;

  if (!content) {
    return res.status(400).send("Content is required");
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post?.owner.toString() !== req.user?._id.toString()) {
      return res.status(401).send("Only owner can edit this post");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      { _id: postId },
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(500).send("Something went wrong please try again");
    }

    return res.status(200).json({
      message: "Post updated !!",
      data: updatedPost,
    });
  } catch (error) {
   
    return res.status(500).send("ERROR updating post : " + error);
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).send("invalid postId");
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post.owner.toString() !== req.user?._id.toString()) {
      return  res.status(401).send("only post owner can delete the post")
    }

  await Post.findByIdAndDelete(postId);

  res.status(200).send("Post delete successful")

  } catch (error) {
    
    return res.status(500).send("ERROR deleting post : " + error);
  }
};

const getChannelPosts = async (req, res) => {
  try {
    const channelId = req.params.channelId;

    const posts = await Post.aggregate([
        {
          $match: {
           owner: new mongoose.Types.ObjectId(channelId), 
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
          $addFields: {
            likes: { $ifNull: ["$likes", []] }, 
          },
        },
        {
          $project: {
            _id: 1,
            content: 1, 
            createdAt: 1,
            channelId : "$ownerDetails._id", 
            "ownerDetails.channelName": 1, 
            "ownerDetails.avatarImage.url": 1, 
            likes: { $size: "$likes" },
           
          }
        }
      
    ]);

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this channel" });
    }

    res.status(200).json(posts);

  } catch (error) {
    console.error("Error fetching channel posts: ", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {createPost , updatePost , deletePost, getChannelPosts}
