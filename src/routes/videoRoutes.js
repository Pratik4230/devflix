const express = require("express");
const { uploadVideo, updateVideo, deleteVideo, toggleVideoPublish ,  getVideoById , getVideosByChannel , getFeed, getVideosToManage} = require("../controllers/video");
const { authUser } = require("../middlewares/authCheck");
const { upload } = require("../middlewares/multer");


const router = express.Router();

router.use(authUser)

router.route("/upload").post(
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    uploadVideo
);

router.route("/update/:videoId").patch(
    upload.single("thumbnail"),
    updateVideo
);

router.route("/delete/:videoId").delete(deleteVideo);
router.route("/togglepublish/:videoId").patch(toggleVideoPublish);
router.route("/vid/:videoId").get(getVideoById);
router.route("/vids/:channelId").get(getVideosByChannel);
router.route("/feed").get(getFeed);
router.route("/manage").get(getVideosToManage);


module.exports = router;
