const express = require("express");
const router = express.Router();

const {authUser} = require("../middlewares/authCheck")

const {createPlaylist, updatePlaylist} = require("../controllers/playlist")

router.route("/create").post(authUser, createPlaylist)
router.route("/update/:playlistId").patch(authUser, updatePlaylist)

module.exports=router