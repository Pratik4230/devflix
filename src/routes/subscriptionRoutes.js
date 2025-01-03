const express =  require("express");

const router = express.Router();

const {authUser} = require("../middlewares/authCheck")
const {toggleSubscription, getUserChannelSubscribers, getSubscribedChannels, getSubsVideos} = require("../controllers/subscription");


router.use(authUser)

router.route("/subscribe/:channelId").post(toggleSubscription)
router.route("/subscribers").get(getUserChannelSubscribers)
router.route("/channels").get(getSubscribedChannels)
router.route("/subsVids").get(getSubsVideos)

module.exports=router