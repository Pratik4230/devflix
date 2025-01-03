const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
   channelName: {
    type:String,
    required: true,
    unique: true,
    trim: true,
    minLength: 2,
   maxLength: 20,
   lowercase:true,

   },

   emailId: {
      type:String,
      required:true,
      unique:true,
      trim:true,
      lowercase:true,
      maxLength: 100,

   },

   password: {
    type:String,
    required: true,
    minLength: 7,
    maxLength: 100
   },

   userName: {
    type:String,
    required:true,
    trim:true,
    lowercase:true,
    minLength: 2,
    maxLength: 20
   },

   avatarImage: {
    url: { type: String },   
    public_id: { type: String } 
   },
   coverImage: {
    url: { type: String }, 
    public_id: { type: String }  
   },



   refreshToken: {
    type: String
},
},
 {timestamps:true}
);

userSchema.methods.getAccessToken =  function () {
  return jwt.sign({_id: this._id} , process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })
};

userSchema.methods.getRefreshToken =  function () {
  return  jwt.sign({_id: this._id , emailId: this.emailId} , process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60d' })
};

userSchema.methods.getPasswordValid = async function (pass) {
 
   return bcrypt.compare(pass, this.password); 
 };
 

 const User = mongoose.model("User" , userSchema);

 module.exports = {User};

