const { Post } = require("../models/postModel");

const createPost = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.send("Login first");
    }

    const { content } = req.body;

    if (!content) {
      return res.send("content is required");
    }

    const post = new Post({
      content: content,
      owner: user._id,
    });

    await post.save();

    return res.status(400).json({
      message: "Post successfully created !!!",
      data: post,
    });
  } catch (error) {
    console.log("ERROR creating post : ", error);

    return res.send("ERROR : " + error);
  }
};

const updatePost = async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;

  if (!content) {
    return res.send("Content is required");
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.send("Post not found");
    }

    if (post?.owner.toString() !== req.user?._id.toString()) {
      return res.send("Only owner can edit this post");
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
      return res.send("Something went wrong please try again");
    }

    return res.status(200).json({
      message: "Post updated !!",
      data: updatedPost,
    });
  } catch (error) {
    console.log("ERROR updating post : ", error);
    return res.send("ERROR updating post : " + error);
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.send("invalid postId");
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.send("Post not found");
    }

    if (post.owner.toString() !== req.user?._id.toString()) {
      return  res.send("only post owner can delete the post")
    }

  await Post.findByIdAndDelete(postId);

  res.status(200).send("Post delete successful")

  } catch (error) {
    console.log("ERROR deleting post : ", error);
    return res.send("ERROR deleting post : " + error);
  }
};

module.exports = {createPost , updatePost , deletePost}
