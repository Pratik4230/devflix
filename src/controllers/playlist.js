const { isValidObjectId } = require("mongoose");
const { Playlist } = require("../models/playlistModel");
const { Video } = require("../models/videoModel");



const createPlaylist = async(req,res) => {
    try {
        const {name, description} = req.body;
    
        if (!name) {
            return res.send("Name of Playlist is Required")
        }
    
       const PlaylistData = {
        name: name,
         owner:req.user?._id
        };
    
       
       if (description) {
        PlaylistData.description = description;
       }
    
        const playlist = new Playlist(PlaylistData)
    
        if (!playlist) {
            return res.send("failed to crete playlist please try again")
        }
    
        await playlist.save();
    
        return res.json({
            message: "Playlist created successfully",
            playlist
        })
    } catch (error) {
        console.log("Error creating playlist : ", error);
        return res.send("Error creating playlist : "+ error)
    }

 }

 const updatePlaylist = async (req,res) => {
    try {
        const {name, description} = req.body;
        const {playlistId} = req.params;
    
        if (!name) {
            return res.send("Name is required")
        }
    
        if (!isValidObjectId(playlistId)) {
            return res.send("Invalid Playlist id ")
        }
    
        const playlist = await Playlist.findById(playlistId);
    
        if (!playlist) {
            return res.send("Playlist not found")
        }
    
        if (playlist.owner?.toString() !== req.user?._id.toString()) {
            return res.send("only owner can edit playlist")
        }
    
        const updateFields = {name,};
    
        if (description) {
            updateFields.description = description;
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            {_id: playlistId},
          {
            $set: updateFields
          },
          {new:true}
        )
    
        if (!updatedPlaylist) {
            return res.send("failed to update playlist please try again ")
        }
    
        return res.status(200).json({
            message: "playlist updated successfully",
            updatedPlaylist
        })
    } catch (error) {
        console.log("Error update playlist : " , error);
        return res.send("Error update playlist : " + error)
        
    }

 }

 const deletePlaylist = async (req, res) => {
    try {
        const {playlistId} = req.params;
    
        if (!isValidObjectId(playlistId)) {
            return res.send("invalid playlist id")
        }
    
      const playlist = await Playlist.findById(playlistId)
    
      if (!playlist) {
        return res.send("playlist not found")
      }
    
      if (playlist.owner?.toString() !== req.user?._id.toString()) {
        return res.send("Only owner can delete Playlist")
      }
    
     const deleted = await Playlist.findByIdAndDelete(playlistId);
    
     if (!deleted) {
        return res.send("Failed to delete Please try again")
     }
    
     return res.status(200).send("Playlist deleted successfully")
    
    } catch (error) {
        console.log("Error delete playlist : " ,error);
        return res.send("Error delete playlist : " + error)
    }
 }

 const addVideoInPlaylist = async(req,res) => {
    try {
        const {playlistId, videoId} = req.params;
    
        if (!isValidObjectId(playlistId)) {
            return res.send("invalid playlist id")
        }
        if (!isValidObjectId(videoId)) {
            return res.send("invalid video id")
        }
    
        const playlist = await Playlist.findById(playlistId);
        const video = await Video.findById(videoId);
    
        if (!playlist) {
            return res.send("Playlist not found")
        }
        if (!video) {
            return res.send("video not found")
        }
    
        if (playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()) {
            return res.send("only owner can add video in the playlist")
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            {_id: playlist?._id},
            {$addToSet: {videos: videoId}},
            {new:true}
        )
    
        if (!updatedPlaylist) {
           return res.send("failed to add video in playlist Please try Again") 
        }
    
        return res.status(200).json({
            message: "video added in playlist successfully",
            updatedPlaylist
        })
    } catch (error) {
        console.log("error adding video in Playlist : " , error);
        return res.send("error adding video in Playlist : " + error)
    }
 }

 const removeVideoFromPlaylist = async(req,res) => {
    const {playlistId, videoId} = req.params;

    if (!isValidObjectId(playlistId)) {
        return res.send("invalid playlist id")
    }
    if (!isValidObjectId(videoId)) {
        return res.send("invalid video id")
    }

    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);

    if (!playlist) {
        return res.send("Playlist not found")
    }
    if (!video) {
        return res.send("video not found")
    }

    if (playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()) {
        return res.send("only owner can add video in the playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        {_id: playlist?._id},
        {$pull: {videos: videoId}},
        {new:true}
    )

    if (!updatedPlaylist) {
       return res.send("failed to add video in playlist Please try Again") 
    }

    return res.status(200).json({
        message: "video added in playlist successfully",
        updatedPlaylist
    })
 }


 module.exports={createPlaylist , updatePlaylist, deletePlaylist, addVideoInPlaylist, removeVideoFromPlaylist}