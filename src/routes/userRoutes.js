const express = require("express");

const router = express.Router();


const { 
    signUpUser, logInUser,logoutUser,renewAccess, getProfile , updatePassword, updateAvatarImage, updateCoverImage, getChannel , getWatchHistory
} = require("../controllers/userAuth.js");

const {upload}  = require("../middlewares/multer.js")
const { authUser } = require("../middlewares/authCheck");


router.route("/signup").post(signUpUser)
router.route("/login").post(logInUser)

router.route("/auth").get(authUser, getProfile)


router.route("/logout").post(authUser, logoutUser)
router.route("/updatepassword").patch(authUser, updatePassword)
router.route("/renewAccess").post(authUser , renewAccess)
router.route("/profile" ).get(authUser, getProfile)
router.route("/updateavatarimage" ).patch(authUser, upload.single("avatar"), updateAvatarImage)
router.route("/updatecoverimage").patch(authUser, upload.single("coverImage"), updateCoverImage)

router.route("/channel/:channelId").get(authUser , getChannel )
router.route("/watch/history").get(authUser , getWatchHistory)



module.exports=router