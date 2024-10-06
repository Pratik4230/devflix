const { isValidObjectId } = require("mongoose");
const { Playlist } = require("../models/playlistModel");



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
 module.exports={createPlaylist , updatePlaylist}