const jwt = require("jsonwebtoken");
const {User} = require("../models/userModel")
const authUser = async (req, res, next) => {
    try {

     const accessToken  = req.cookies?.accessToken;

     if (!accessToken ) {
        return res.status(401).send("Log in first !!!")
     }

     const decodedData = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

     const loggedInUser = decodedData._id;

    const user = await User.findById(loggedInUser);

    if (!user) {
        return res.status(401).send("Invalid Access Token")
    }
     
req.user = user;
next()
        
    } catch (error) {
        res.send("ERROR : " + error);
    }
   
}

module.exports= {authUser}

