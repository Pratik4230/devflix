const mongoose = require("mongoose")
const { Subscription } = require("../models/subscriptionModel");
const {User} = require("../models/userModel")


const toggleSubscription = async (req,res) => {
    try {
        const {channelId} = req.params;
        
    
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ message: "Invalid channelId" });
        }
    
        const channelExists = await User.findById(channelId);
        if (!channelExists) {
            return res.status(404).json({ message: "Channel  not found" });
        }
    
    
        const subscribed = await Subscription.findOne({
            subscriber: req.user?._id,
            channel: channelId
        })
    
        if (subscribed) {
            await Subscription.findByIdAndDelete(subscribed._id);
    
            return res.status(200).json({
                isSubscribed : false,
                message: "Unsubscribed successfully"
            })
        }
    
        const subscription = new Subscription({
            subscriber:req.user?._id,
            channel: channelId
        })
    
        if (!subscription) {
            return res.send("Failed to subscribe please try again")
        }
    
        await subscription.save();
    
        return res.status(200).json({
            isSubscribed: true,
            message: "Subscribed Successfully"
        })
    } catch (error) {
        console.log("Error toggle subscription : " , error);
        
    }
}

module.exports={toggleSubscription}