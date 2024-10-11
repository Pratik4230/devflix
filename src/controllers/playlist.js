const { isValidObjectId } = require("mongoose");
const { Playlist } = require("../models/playlistModel");
const { Video } = require("../models/videoModel");



const createPlaylist = async(req,res) => {
    try {
        const {name, description} = req.body;
    
        if (!name) {
            return res.status(400).send("Name of Playlist is Required")
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
            return res.status(500).send("failed to crete playlist please try again")
        }
    
        await playlist.save();
    
        return res.status(201).json({
            message: "Playlist created successfully",
            playlist
        })
    } catch (error) {
        
        return res.status(500).send("Error creating playlist : "+ error)
    }

 }

 const updatePlaylist = async (req,res) => {
    try {
        const {name, description} = req.body;
        const {playlistId} = req.params;
    
        
    
        if (!isValidObjectId(playlistId)) {
            return res.status(400).send("Invalid Playlist id ")
        }
    
        const playlist = await Playlist.findById(playlistId);
    
        if (!playlist) {
            return res.status(404).send("Playlist not found")
        }
    
        if (playlist.owner?.toString() !== req.user?._id.toString()) {
            return res.status(401).send("only owner can edit playlist")
        }
    
        const updateFields = {};
    
        if (description) {
            updateFields.description = description;
        }
        if (name) {
            updateFields.name = name;
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            {_id: playlistId},
          {
            $set: updateFields
          },
          {new:true}
        )
    
        if (!updatedPlaylist) {
            return res.status(500).send("failed to update playlist please try again ")
        }
    
        return res.status(200).json({
            message: "playlist updated successfully",
            updatedPlaylist
        })
    } catch (error) {
    
        return res.status(500).send("Error update playlist : " + error)
        
    }

 }

 const deletePlaylist = async (req, res) => {
    try {
        const {playlistId} = req.params;
    
        if (!isValidObjectId(playlistId)) {
            return res.status(400).send("invalid playlist id")
        }
    
      const playlist = await Playlist.findById(playlistId)
    
      if (!playlist) {
        return res.status(404).send("playlist not found")
      }
    
      if (playlist.owner?.toString() !== req.user?._id.toString()) {
        return res.status(401).send("Only owner can delete Playlist")
      }
    
     const deleted = await Playlist.findByIdAndDelete(playlistId);
    
     if (!deleted) {
        return res.status(500).send("Failed to delete Please try again")
     }
    
     return res.status(200).send("Playlist deleted successfully")
    
    } catch (error) {
        
        return res.status(500).send("Error delete playlist : " + error)
    }
 }

 const addVideoInPlaylist = async(req,res) => {
    try {
        const {playlistId, videoId} = req.params;
    
        if (!isValidObjectId(playlistId)) {
            return res.status(400).send("invalid playlist id")
        }
        if (!isValidObjectId(videoId)) {
            return res.status(400).send("invalid video id")
        }
    
        const playlist = await Playlist.findById(playlistId);
        const video = await Video.findById(videoId);
    
        if (!playlist) {
            return res.status(404).send("Playlist not found")
        }
        if (!video) {
            return res.status(404).send("video not found")
        }
    
        if (playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()) {
            return res.status(401).send("only owner can add video in the playlist")
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            {_id: playlist?._id},
            {$addToSet: {videos: videoId}},
            {new:true}
        )
    
        if (!updatedPlaylist) {
           return res.status(500).send("failed to add video in playlist Please try Again") 
        }
    
        return res.status(200).json({
            message: "video added in playlist successfully",
            updatedPlaylist
        })
    } catch (error) {
        
        return res.status(500).send("error adding video in Playlist : " + error)
    }
 }

 const removeVideoFromPlaylist = async(req,res) => {
    const {playlistId, videoId} = req.params;

    try {
        if (!isValidObjectId(playlistId)) {
            return res.status(400).send("invalid playlist id")
        }
        if (!isValidObjectId(videoId)) {
            return res.status(400).send("invalid video id")
        }
    
        const playlist = await Playlist.findById(playlistId);
        const video = await Video.findById(videoId);
    
        if (!playlist) {
            return res.status(404).send("Playlist not found")
        }
        if (!video) {
            return res.status(404).send("video not found")
        }
    
        if (playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()) {
            return res.status(401).send("only owner can add video in the playlist")
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            {_id: playlist?._id},
            {$pull: {videos: videoId}},
            {new:true}
        )
    
        if (!updatedPlaylist) {
           return res.status(500).send("failed to add video in playlist Please try Again") 
        }
    
        return res.status(200).json({
            message: "video added in playlist successfully",
            updatedPlaylist
        })
    } catch (error) {
        return res.status(500).send("Error while removing vidoe from playlist " + error)
    }
 }


 module.exports={createPlaylist , updatePlaylist, deletePlaylist, addVideoInPlaylist, removeVideoFromPlaylist}