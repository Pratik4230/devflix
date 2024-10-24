const express = require("express");
const router = express.Router();

const {authUser} = require("../middlewares/authCheck")

const {createPlaylist, updatePlaylist, deletePlaylist, addVideoInPlaylist, removeVideoFromPlaylist, getPlaylists , getPlaylistById} = require("../controllers/playlist")


router.use(authUser)
router.route("/create").post(createPlaylist)
router.route("/update/:playlistId").patch(updatePlaylist)
router.route("/delete/:playlistId").delete(deletePlaylist)
router.route("/addvideo/:playlistId/:videoId").post(addVideoInPlaylist)
router.route("/removevideo/:playlistId/:videoId").post(removeVideoFromPlaylist)
router.route("/playlists/:channelId").get(getPlaylists)
router.route("/playlist/:playlistId").get(getPlaylistById)

module.exports=router