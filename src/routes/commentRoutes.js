const express = require("express");
const {authUser} = require("../middlewares/authCheck")
const router = express.Router();

const {addComment, updateComment, deleteComment} = require("../controllers/comment")

router.route("/addcomment/:videoId").post(authUser, addComment)
router.route("/updatecomment/:commentId").patch(authUser, updateComment)
router.route("/deletecomment/:commentId").delete(authUser, deleteComment)


module.exports=router;