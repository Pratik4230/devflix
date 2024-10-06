const express = require("express");
const router = express.Router();

const {authUser} = require("../middlewares/authCheck")

const {createPlaylist, updatePlaylist, deletePlaylist, addVideoInPlaylist, removeVideoFromPlaylist} = require("../controllers/playlist")

router.route("/create").post(authUser, createPlaylist)
router.route("/update/:playlistId").patch(authUser, updatePlaylist)
router.route("/delete/:playlistId").delete(authUser, deletePlaylist)
router.route("/addvideo/:playlistId/:videoId").post(authUser, addVideoInPlaylist)
router.route("/removevideo/:playlistId/:videoId").post(authUser, removeVideoFromPlaylist)

module.exports=router