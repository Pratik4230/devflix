const express = require("express");
const { toggleVideoLike, toggleCommentLike, togglePostLike , getLikedVideos } = require("../controllers/like");
const { authUser } = require("../middlewares/authCheck");

const router = express.Router();

router.use(authUser);
router.route("/video/:videoId").post(toggleVideoLike);
router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/post/:postId").post(togglePostLike);
router.route("/videos").get(getLikedVideos);

module.exports = router;
