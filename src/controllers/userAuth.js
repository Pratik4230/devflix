
const {ValidateSignUpData, ValidateLogInData} = require("../utils/validations");
const bcrypt = require("bcrypt");
const {User} = require("../models/userModel");

const jwt = require("jsonwebtoken");

const {cloudinaryUpload} = require("../utils/cloudinary")
const cloudinary = require('cloudinary').v2;


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

 const signUpUser =  async (req, res) => {
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
   
}

const logInUser = async (req, res) => {
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
}

const logoutUser = async (req, res) => {
   
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

   
}

const renewAccess = async (req, res) => {

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
}

const getProfile = async(req, res) => {
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
   
}

const updatePassword = async (req, res) => {


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

} 

const updateAvatarImage =   async (req, res) => {

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

   if (!result) {
    return res.send("Something went wrong while updating avatar")
   }

   if (user.avatarImage?.public_id) {
    await cloudinary.uploader.destroy(user.avatarImage.public_id)
   }
   
 const UpdatedUser = await User.findByIdAndUpdate({_id: user._id}, 
    {
        $set: {
            avatarImage: {
                url:result?.url || result?.secure_url,
                public_id: result.public_id
            } }
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
}

const updateCoverImage =  async (req, res) => {

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

   if (!result) {
    return res.send("something went wrong while updating cover image")
   }

   if (user.coverImage?.public_id) {
      await cloudinary.uploader.destroy(user.coverImage.public_id);
   }

 const UpdatedUser = await User.findByIdAndUpdate({_id: user._id}, 
    {
        $set: {
            coverImage:{
                url:result.url || result?.secure_url,
                public_id: result.public_id
            } }
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
}


const getUserChannel = async(req, res) => {
    const {channelName} = req.params

    if (!username?.trim()) {
       return res.send("username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                channelName: channelName.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                SubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                channelName: 1,
                userName: 1,
                subscribersCount: 1,
                SubscribedToCount: 1,
                isSubscribed: 1,
                avatarImage: 1,
                coverImage: 1
            }
        }
    ])

    if (!channel?.length) {
        return res.send("channel doesn't exists")
    }

    return res
    .status(200)
    .json({
        message:  " success",
        data: channel[0]
    })
    
}



const getWatchHistory = async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        channelName: 1,
                                        userName: 1,
                                        avatarImage: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json({
        message: "Success",
        data: user[0].watchHistory,
    }
    )
    
}


module.exports={signUpUser, logInUser,logoutUser,renewAccess, getProfile , updatePassword, updateAvatarImage, updateCoverImage, getUserChannel , getWatchHistory};