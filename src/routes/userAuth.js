const express = require("express");
const {ValidateSignUpData, ValidateLogInData} = require("../utils/validations");
const bcrypt = require("bcrypt");
const {User} = require("../models/userModel");
const { authUser } = require("../middlewares/authCheck");
const jwt = require("jsonwebtoken");
const { upload } = require("../middlewares/multer");
const {cloudinaryUpload} = require("../utils/cloudinary")



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

authRouter.post("/logout" , authUser , async (req, res) => {
   
    await User.findByIdAndUpdate(

        req.user._id,
        {
            $unset:{               //This is a MongoDB operator used to remove a field from a document.
                refreshToken: 1    //refreshToken: 1: This specifies that the refreshToken field should be removed from the user’s document in the database. 1 here is a flag indicating the field should be deleted.
            }
        },
        {
            new: true              //This tells Mongoose to return the updated document after applying the changes (i.e., removing the refreshToken).
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json("User logged Out")

   
})

authRouter.post("/renewAccess" , async (req, res) => {

    try { 
       
       const clientsRefreshToken = req.cookies?.refreshToken;
            if (!clientsRefreshToken) {
                return res.send("No tokens")
               }
        //   console.log(clientsRefreshToken);
        

      const decodedData = jwt.verify(clientsRefreshToken , process.env.REFRESH_TOKEN_SECRET);
             if (!decodedData) {
                 return res.send("Invalid Token");
                }
        //  console.log(decodedData);


       const user = await User.findById(decodedData._id);
         if (!user) {
             return res.send("Invalid Token");
            }
         
       if (clientsRefreshToken !== user?.refreshToken) {
           return res.send("Invalid Token");
       }
     

      const {accessToken , refreshToken} = await createAccessTokenAndRefreshToken(user._id);
      
       return res
       .status(200)
       .cookie("accessToken", accessToken , options)
       .cookie("refreshToken", refreshToken , options)      
       .send("access token renewed")
    } catch (error) {
        console.log("ERROR in renewToken: " , error);
        
    }
})

authRouter.get("/profile" , authUser , async(req, res) => {
   const user = req.user;


   if (!user) {
    return res.send("Login first")
   }

   try {
    const profile = user.toObject();
 
    const removeKeys = ["refreshToken", "password" ];
 
    removeKeys.forEach(key => {
     delete profile[key];
    })
 
    res.status(200).json({
     message: "User Profile",
     data: profile
    })
   } catch (error) {
    console.log("ERROR while getProfile : ", error);
    return res.send("ERROR while getProfile : " + error)
   }
   
})

authRouter.patch("/updatepassword" , authUser , async (req, res) => {


    try {
        const user = req.user;        

        if (!user) {
            return res.send("Login First!!!")
        }
    
        const { oldPassword , newPassword} = req.body;
    
       const isPasswordValid = await user.getPasswordValid(oldPassword);
    
    if (!isPasswordValid) {
       return res.send("Invalid Credentials");
    }
    
    const validatePassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    };
    
     if(!validatePassword(newPassword)){
        return res.send("Enter strong new Password")
     }
    
     const hashedPassword  =  await bcrypt.hash(newPassword , 11)
       
     user.password = hashedPassword;
    
     await user.save({validateBeforeSave: false});
    
     return res.status(200).send("password changed successfully")
    } catch (error) {
        console.log("ERROR password update : " , error);
       return req.send("ERROR password update : " + error)
    }

} )

authRouter.patch("/updateavatarimage" , authUser , upload.single('avatar') ,  async (req, res) => {

   try {

    const user = req.user;

    if (!user) {
        return res.send("Log In first")
    }

     const avatarPath = req.file?.path;


     if (!avatarPath) {
        res.send("Avatar file is missing")
     }

   const result = await cloudinaryUpload(avatarPath);

 const UpdatedUser = await User.findByIdAndUpdate({_id: user._id}, 
    {
        $set: {avatarImage: result.url}
    },
    {new: true}
  ).select("-password")
   
   res.status(200).json({message: "success",
    UpdatedUser
   })

    
   } catch (error) {
    console.log("ERROR avatar update : " ,error);
    return res.send("ERROR avatar update : " + error)
    
   }
})

authRouter.patch("/updatecoverimage" , authUser , upload.single('coverImage') ,  async (req, res) => {

   try {

    const user = req.user;

    if (!user) {
        return res.send("Log In first")
    }

     const coverImagePath = req.file?.path;


     if (!coverImagePath) {
        res.send("Cover Image file is missing")
     }

   const result = await cloudinaryUpload(coverImagePath);

 const UpdatedUser = await User.findByIdAndUpdate({_id: user._id}, 
    {
        $set: {coverImage: result.url}
    },
    {new: true}
  ).select("-password")
   
   res.status(200).json({message: "success",
    UpdatedUser
   })

    
   } catch (error) {
    console.log("ERROR coverImage update : " ,error);
    return res.send("ERROR coverImage update : " + error)
    
   }
})


module.exports={authRouter};