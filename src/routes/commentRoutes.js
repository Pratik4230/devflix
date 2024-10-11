const express = require("express");
const { addComment, updateComment, deleteComment } = require("../controllers/comment");
const { authUser } = require("../middlewares/authCheck");

const router = express.Router();

router.route("/add/:videoId").post(authUser, addComment);
router.route("/update/:commentId").patch(authUser, updateComment);
router.route("/delete/:commentId").delete(authUser, deleteComment);

module.exports = router;
