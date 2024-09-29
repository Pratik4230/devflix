const express = require("express");
const {ValidateSignUpData, ValidateLogInData} = require("../utils/validations");
const bcrypt = require("bcrypt");
const {User} = require("../models/userModel");



const authRouter = express.Router();

const options = {
    httpOnly: true,
    secure: true
}

 async function createAccessTokenAndRefreshToken(user_id){

    try {
        const user = await User.findById(user_id);
    
       const accessToken = user.getAccessToken();
       const refreshToken = user.getRefreshToken();
    
       user.refreshToken = refreshToken ;
    
       await user.save({validateBeforeSave: false});
    
       return { accessToken , refreshToken};

    } catch (error) {
        console.log("ERROR in creating tokens : " , error);
        
    }


}

authRouter.post("/signup" , async (req, res) => {
try {
    // console.log(req.body);

    const { password,userName , emailId , channelName} = req.body;

    const valid = ValidateSignUpData(req);
    // console.log(valid);
    
   const existingUser = await User.findOne({
        emailId: emailId
    });
    if (existingUser) {
        return res.send("User already created" )
    }
    
    
 const hashedPassword  =  await bcrypt.hash(password , 11)
// console.log("hash" , hashedPassword);

const user  = new User({
      userName,
      emailId,
      channelName,
      password: hashedPassword
  });

  await user.save();

  let userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.status(200).json({
    message:"user signup successful",
      data: userWithoutPassword
})


} catch (error) {
    console.log(error);
    
    return res.status(400).send("Sign Up Error : " + error.message)
    
}
   
})

authRouter.post("/login" , async (req, res) => {
    try {
        const {emailId , password} = req.body;

        // console.log(req.body);
        

       const valid = ValidateLogInData(req);
        // console.log(valid);

       const user = await User.findOne({emailId: emailId});

       if (!user) {
        return res.send("User doen't exist");
       };

     const isPasswordValid = await user.getPasswordValid(password);

     if (!isPasswordValid) {
        return res.send("Invalid credentials")
     }

        const {accessToken , refreshToken} = await createAccessTokenAndRefreshToken(user._id);
        

        let userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken ,options)
        .json({message: "login successful !!!",
            data: userWithoutPassword
        })


       
    } catch (error) {
        console.log("ERROR login : " , error);
        
    }
})

module.exports={authRouter};