const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    video: {
        type:String,
        required: true,
    },

    thumbnail: {
        type:String,
        required: true,
    },

    title:{
        type:String,
        required: true,
    },

    description: {
        type: String, 
    },

    views: {
        type: Number,
        default: 0
    },

    duration: {
        type: Number, 
        required: true
    },

    owner: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
}, {timestamps:true});


const Video = mongoose.model("Video" , videoSchema);

module.exports={Video};