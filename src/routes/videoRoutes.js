const express = require("express");
const router = express.Router();
const {authUser} = require("../middlewares/authCheck");
const {upload} = require("../middlewares/multer")

const {uploadVideo, updateVideo} = require("../controllers/video");


router.route("/upload").post(authUser, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]) , uploadVideo)

router.route("/update/:videoId").patch(authUser, upload.single("thumbnail"), updateVideo)


module.exports=router