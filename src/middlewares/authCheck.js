const jwt = require("jsonwebtoken");
const {User} = require("../models/userModel")


const authUser = async (req, res, next) => {
    try {

      
     const accessToken  = req.cookies?.accessToken;
     
     

     if (!accessToken ) {
        return res.status(401).json({message: "Log in first authcheck !!!"})
     }

     const decodedData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

     const loggedInUser = decodedData._id;

    const user = await User.findById(loggedInUser);

    if (!user) {
        return res.status(401).json({message: "Invalid Access Token"})
    }
     
req.user = user;
next()
        
    } catch (error) {
        res.json({error});
    }
   
}

module.exports= {authUser}

