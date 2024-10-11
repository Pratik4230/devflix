const express = require("express");
const { uploadVideo, updateVideo, deleteVideo, toggleVideoPublish } = require("../controllers/video");
const { authUser } = require("../middlewares/authCheck");
const { upload } = require("../middlewares/multer");

const router = express.Router();

router.route("/upload").post(
    authUser,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    uploadVideo
);

router.route("/update/:videoId").patch(
    authUser,
    upload.single("thumbnail"),
    updateVideo
);

router.route("/delete/:videoId").delete(authUser, deleteVideo);
router.route("/togglepublish/:videoId").patch(authUser, toggleVideoPublish);

module.exports = router;
