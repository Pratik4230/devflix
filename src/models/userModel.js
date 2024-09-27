const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
   userName: {
    type:String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
   },

   emailId: {
      type:String,
      required:true,
      unique:true,
      trim:true,
      lowercase:true,
   },

   password: {
    type:String,
    required: true,
   },

   fullName: {
    type:String,
    required:true,
    trim:true,
   },

   avatarImage: {
    type:String,
   },
   coverImage: {
    type: String,
   },

   watchHistory:[
    {
        type: Schema.Types.ObjectId,
         ref: "Video"
    }
   ],

   refreshToken: {
    type: String
},
},
 {timestamps:true}
)

 const User = mongoose.model("User" , userSchema);

 module.exports = {User};

