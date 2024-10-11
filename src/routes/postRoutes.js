const express = require("express");
const { createPost, updatePost, deletePost } = require("../controllers/post");
const { authUser } = require("../middlewares/authCheck");

const router = express.Router();

router.route("/create").post(authUser, createPost);
router.route("/update/:postId").patch(authUser, updatePost);
router.route("/delete/:postId").delete(authUser, deletePost);

module.exports = router;
