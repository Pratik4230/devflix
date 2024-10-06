const express = require("express")

const router = express.Router();

const {toggleVideoLike, toggleCommentLike, togglePostLike} = require("../controllers/like");
const { authUser } = require("../middlewares/authCheck");

router.use(authUser)
router.route("/video/:videoId").post(toggleVideoLike);
router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/post/:postId").post(togglePostLike);


module.exports=router;