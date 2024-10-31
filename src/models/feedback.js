const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    content: {
        type: String,
        required: true,
        
    },

    username: {
        type: String,
    } 
}, {timestamps: true})

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports={Feedback}