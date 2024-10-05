const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    video: {
        type: {
            url: String,
            public_id: String,
        },
        required: true,
    },

    thumbnail: {
        type: {
            url: String,
            public_id: String,
        },
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
    isPublished: {
        type: Boolean,
        default: false,
    },
}, {timestamps:true});


const Video = mongoose.model("Video" , videoSchema);

module.exports={Video};
