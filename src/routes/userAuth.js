const express = require("express");
const {ValidateSignUpData} = require("../utils/validations");
const bcrypt = require("bcrypt");
const {User} = require("../models/userModel");



const authRouter = express.Router();

authRouter.post("/signup" , async (req, res) => {
try {
    // console.log(req.body);

    const { password,userName , emailId , channelName} = req.body;

   const existingUser = await User.findOne({
        emailId: emailId
    });
    if (existingUser) {
        return res.send("User already created" )
    }

    const valid = ValidateSignUpData(req);
    // console.log(valid);
    
    
 const hashedPassword  =  await bcrypt.hash(password , 11)
// console.log("hash" , hashedPassword);

const user  = new User({
      userName,
      emailId,
      channelName,
      password: hashedPassword
  });

  await user.save();

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.status(200).json({
    message:"user signup successful",
      data: userWithoutPassword
})


} catch (error) {
    return res.status(400).send("Sign Up Error : " + error.message)
    
}
   
})

module.exports={authRouter};