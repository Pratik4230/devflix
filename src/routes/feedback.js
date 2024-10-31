const express = require("express");
const { feedback } = require("../controllers/feedbacks");
const { authUser } = require("../middlewares/authCheck");

const router = express.Router();

router.route("/message").post(authUser,feedback);

module.exports=router;