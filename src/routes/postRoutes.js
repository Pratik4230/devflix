const express = require("express");
const { createPost, updatePost, deletePost, getChannelPosts } = require("../controllers/post");
const { authUser } = require("../middlewares/authCheck");


const router = express.Router();

router.use(authUser)
router.route("/create").post(createPost);
router.route("/update/:postId").patch(updatePost);
router.route("/delete/:postId").delete(deletePost);
router.route("/channel/:channelId").get(getChannelPosts);



module.exports = router;
