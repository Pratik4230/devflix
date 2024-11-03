const mongoose = require("mongoose")
const { Subscription } = require("../models/subscriptionModel");
const {User} = require("../models/userModel")
const {Video} = require('../models/videoModel')


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
    
        
        if (channelId.toString() === req.user?._id.toString()) {
            return res.status(400).json({ message: "You cannot subscribe to yourself" });
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
            return res.status(500).send("Failed to subscribe please try again")
        }
    
        await subscription.save();
    
        return res.status(200).json({
            isSubscribed: true,
            message: "Subscribed Successfully"
        })
    } catch (error) {
        return res.status(500).send("Error toggle subscription : " , error);
        
    }
}

const getUserChannelSubscribers = async (req, res) => {
    try {
        const userId = req.user._id;  
 
        const subscribers = await Subscription.aggregate(
            [
                {
                  $match: { channel: new mongoose.Types.ObjectId(userId) }
                },
              
                 {
                      $lookup: {
                        from: "users", 
                        localField: "subscriber",
                        foreignField: "_id", 
                        as: "subscriberDetails",
                      },
                    },
                    {
                      $unwind: "$subscriberDetails", 
                    },
                    {
                      $project: {
                        _id: "$subscriberDetails._id", 
                        channelName: "$subscriberDetails.channelName",
                        avatarImage: "$subscriberDetails.avatarImage.url",
                      },
                    },
                ]
    );

    if (!subscribers || !subscribers.length) {
        return res.status(204).json({ message: "no one has subscribed to you channel" });
      }
  
      return res.status(200).json(subscribers);

    } catch (error) {
      console.error("Error fetching channel subscribers: ", error);
      return res.status(500).json({ message: "Server error" });
    }
}

const getSubscribedChannels  = async (req, res) => {
    try {
        const userId = req.user._id;  
 
        const subscribedChannels = await Subscription.aggregate(
            [
                {
                  $match: { subscriber: new mongoose.Types.ObjectId(userId) }
                },
              
                 {
                      $lookup: {
                        from: "users", 
                        localField: "channel",
                        foreignField: "_id", 
                        as: "channels",
                      },
                    },
                    {
                      $unwind: "$channels", 
                    },
                    {
                      $project: {
                        _id: "$channels._id", 
                        channelName: "$channels.channelName",
                        avatarImage: "$channels.avatarImage.url",
                      },
                    },
                ]
    );
   
    
    if (!subscribedChannels || !subscribedChannels.length) {
        return res.status(204).json({ message: "No subscribed channel found"
         });
      }
     
  
      return res.status(200).json(subscribedChannels);
     
    } catch (error) {

      console.log("Error fetching subscribed channels: ", error);
      return res.status(500).json({ message: "Server error" });
    }


}


const getSubsVideos = async (req, res) => {
  try {
      const userId = req.user._id; 

      
      
      const subscriptions = await Subscription.find({ subscriber: userId }).populate('channel');
     
      if (!subscriptions || subscriptions.length === 0) {
        return res.status(204).json({ message: "No subscriptions found" });
      }

      const channelIds = subscriptions.map((sub) => sub.channel?._id);
      
      if (channelIds.length === 0) {
          return res.status(204).json({ message: "No subscriptions found" });
      }
      
      const videos = await Video.aggregate([
          {
              $match: {
                  owner: { $in: channelIds }, 
                  isPublished: true, 
              }
          },
          {
              $sample: { size: 10 } 
          },
          {
              $lookup: {
                  from: "users", 
                  localField: "owner",
                  foreignField: "_id",
                  as: "ownerDetails"
              }
          },
          {
              $unwind: "$ownerDetails" 
          },
          {
              $project: {
                
                  title: 1,
                  description: 1,
                  thumbnail: 1,
                  views: 1,
                  duration: 1,
                  "ownerDetails.channelName": 1,
                  "ownerDetails.avatarImage.url": 1,
                  createdAt: 1
              }
          }
      ]);
     
      if (!videos || videos.length === 0) {
        return res.status(204).json({ message: "No videos uploaded by channel owner" });
      }
    
      return res.status(200).json({
        message: "Fetched subscribed videos successfully",
         videos
         });
  } catch (error) {
      console.log("Error fetching subscription videos" , error);
      return res.status(500).json({ message: "Internal server error", error });
  }
};



module.exports={toggleSubscription, getUserChannelSubscribers, getSubscribedChannels, getSubsVideos}