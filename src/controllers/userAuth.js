
const {ValidateSignUpData, ValidateLogInData} = require("../utils/validations");
const bcrypt = require("bcrypt");
const {User} = require("../models/userModel");

const jwt = require("jsonwebtoken");

const {cloudinaryUpload} = require("../utils/cloudinary");
const { default: mongoose } = require("mongoose");
const cloudinary = require('cloudinary').v2;


const accessTokenOptions = {
    httpOnly: true,
    secure: true,      
    sameSite: 'lax', 
    expiresIn: "2d"
};

const refreshTokenOptions = {
    httpOnly: true,
    secure: true,       
    sameSite: 'lax',
    expiresIn: "7d"
};

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
   

    const { password,userName , emailId , channelName} = req.body;

       ValidateSignUpData(req);
   
    
   const existingUser = await User.findOne({
        emailId: emailId
    });
    if (existingUser) {
        return res.status(400).json({message :"User already created" })
    }

   const existingChannel = await User.findOne({
        channelName: channelName
    });
    if (existingChannel) {
        return res.status(400).json({message :"Channel Name already exists " })
    }
    
    
 const hashedPassword  =  await bcrypt.hash(password , 11)


const user  = new User({
      userName,
      emailId,
      channelName,
      password: hashedPassword
  });

  await user.save();

  const createdUser = await User.findOne({emailId: emailId});

  if (!createdUser) {
    return res.status(404).jsom({message:"somehting went wrong please try again"})
  }

  const {accessToken , refreshToken} = await createAccessTokenAndRefreshToken(createdUser._id);
        

  let userWithoutPassword = createdUser.toObject();
  delete userWithoutPassword.password;

  return res
  .status(201)
  .cookie("accessToken" , accessToken , accessTokenOptions)
  .cookie("refreshToken" , refreshToken ,refreshTokenOptions)
  .json({message: "user signup successful !!!",
      data: userWithoutPassword
  })


} catch (error) {
    console.log(error);
    
       return res.status(500)
       .json({
         message : "Sign Up Error Please try again ",
         data : error.message
       })
}
}

const logInUser = async (req, res) => {
    try {
        const {emailId , password} = req.body;

        ValidateLogInData(req);

       const user = await User.findOne({emailId: emailId});

       if (!user) {
        return res.status(404).json({message: "User doen't exist"});
       };

     const isPasswordValid = await user.getPasswordValid(password);

     if (!isPasswordValid) {
        return res.status(401).json({message: "Invalid credentials"})
     }

        const {accessToken , refreshToken} = await createAccessTokenAndRefreshToken(user._id);
        

        let userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return res
        .status(200)
        .cookie("accessToken" , accessToken , accessTokenOptions)
        .cookie("refreshToken" , refreshToken ,refreshTokenOptions)
        .json({message: "login successful !!!",
            data: userWithoutPassword
        })
       
    } catch (error) {
console.log(error);

        return res.status(500)
                  .json({
                     message :"An unexpected error occurred. Please try again.",
                    error
                    });        
    }
}

const logoutUser = async (req, res) => {
   
    try {
        await User.findByIdAndUpdate(
    
            req.user._id,
            {
                $unset:{               
                    refreshToken: 1   
                }
            },
            {
                new: true              
            }
        )
    
        return res
        .status(200)
        .clearCookie('accessToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
          })
          .clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
          })
          .json("User logged Out")
    
    } catch (error) {
        return res.status(500).json({
            message : "unexpected error accured please try again",
             error
        })
    }
   
}

const renewAccess = async (req, res) => {

    try { 
       
       const clientsRefreshToken = req.cookies?.refreshToken;
            if (!clientsRefreshToken) {
                return res.status(400).send("Please Log in again")
               }
        

      const decodedData = jwt.verify(clientsRefreshToken , process.env.REFRESH_TOKEN_SECRET);
             if (!decodedData) {
                 return res.status(400).send(" Please Log in again");
                }


       const user = await User.findById(decodedData._id);
         if (!user) {
             return res.status(400).send(" Please Log in again");
            }
         
       if (clientsRefreshToken !== user?.refreshToken) {
           return res.status(401).send("Please Log in again");
       }

      const {accessToken , refreshToken} = await createAccessTokenAndRefreshToken(user._id);
      
       return res
       .status(200)
       .cookie("accessToken", accessToken , accessTokenOptions)
       .cookie("refreshToken", refreshToken , refreshTokenOptions)      
       .send("access token renewed")
    } catch (error) {
        console.log("ERROR in renewToken: " , error);
        res.status(500).json({
            message: "something went wrong please try again",
            error
        })
    }
}

const getProfile = async(req, res) => {
   const user = req.user;


   if (!user) {
    return res.status(401).json({message: "Login first"})
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
    return res.status(500).json({
        message: " something went wront please try again ",
         error
        })
   }
   
}

const updatePassword = async (req, res) => {
    try {
        const user = req.user;        

        if (!user) {
            return res.status(401).send("Login First!!!")
        }
    
        const { oldPassword , newPassword} = req.body;
    
       const isPasswordValid = await user.getPasswordValid(oldPassword);
    
    if (!isPasswordValid) {
       return res.status(401).send("Invalid Credentials");
    }
    
    const validatePassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    };
    
     if(!validatePassword(newPassword)){
        return res.status(400).send("Enter strong new Password")
     }
    
     const hashedPassword  =  await bcrypt.hash(newPassword , 11)
       
     user.password = hashedPassword;
    
     await user.save({validateBeforeSave: false});
    
     return res.status(200).send("password changed successfully")
    } catch (error) {
      
       return req.status(500).json({
        message: "something went wrong ",
         error
    })
    }

} 

const updateAvatarImage =   async (req, res) => {

   try {

    const user = req.user;

    if (!user) {
        return res.status(401).send("Log In first")
    }

     const avatarPath = req.file?.path;


     if (!avatarPath) {
        res.status(400).send("Avatar file is missing")
     }

   const result = await cloudinaryUpload(avatarPath);

   if (!result) {
    return res.status(500).send("Something went wrong while updating avatar Please try again")
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
    return res.status(500).json({ 
        message: "ERROR avatar update : " ,
         error
   })
   }
}

const updateCoverImage =  async (req, res) => {

   try {

    const user = req.user;

    if (!user) {
        return res.status(401).send("Log In first")
    }

     const coverImagePath = req.file?.path;


     if (!coverImagePath) {
        res.status(400).send("Cover Image file is missing")
     }

   const result = await cloudinaryUpload(coverImagePath);

   if (!result) {
    return res.status(500).send("something went wrong while updating cover image")
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
   
   res.status(200).json({
    message: "success",
    UpdatedUser
   })

    
   } catch (error) {
    return res.status(500).json({
        message: "ERROR coverImage update : " ,
         error
        })
    
   }
}


const getChannel = async(req, res) => {
    const {channelId} = req.params

    if (!channelId) {
       return res.status(400).send("channelid is missing")
    }

try {
    
        const channel = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(channelId)
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
            return res.status(404).send("channel doesn't exists")
        }
    
        return res
        .status(200)
        .json({
            message:  " success",
            data: channel[0]
        })
} catch (error) {
    return res.status(500).send("server error getChannel")
}
    
}



const getWatchHistory = async(req, res) => {
    try {

      const userId = req.user.user_id;
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
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
        ]);

        if(!user || user.length == 0) {
            return res.status(404).send("no watch history ")
        }
    
        return res.status(200).json({
            message: "Success",
            data: user[0].watchHistory,
        }
        )
    } catch (error) {
      console.log(error);
      
        return res.status(500).send("server error watch history")
    }
    
}


module.exports={signUpUser, logInUser,logoutUser,renewAccess, getProfile , updatePassword, updateAvatarImage, updateCoverImage, getChannel , getWatchHistory};