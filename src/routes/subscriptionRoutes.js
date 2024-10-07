const express =  require("express");

const router = express.Router();

const {authUser} = require("../middlewares/authCheck")
const {toggleSubscription} = require("../controllers/subscription");


router.use(authUser)

router.route("/subscribe/:channelId").post(toggleSubscription)

module.exports=router