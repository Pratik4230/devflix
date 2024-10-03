const express = require("express");
const { authUser } = require("../middlewares/authCheck");


const router = express.Router();

const { createPost, updatePost, deletePost } = require("../controllers/post");

router.route("/createpost").post(authUser , createPost);
router.route("/updatepost/:postId").patch(authUser, updatePost);
router.route("/deletepost/:postId").delete(authUser, deletePost);


module.exports=router;