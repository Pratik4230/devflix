const { Feedback } = require("../models/feedback");


const feedback = async (req,res) => {

    try {
        const {content, username} = req.body;

   if (!(content && username)) {
    return res.status(400).send("feedback and username required")
   }

   const feedback =  new Feedback({
    content: content,
    username: username
   })

   if (!feedback) {
    return res.status(500).send("something went wrong please try again")
   }

   await feedback.save();

   return res.status(201).send("Feedback send successfully")

    } catch (error) {
        console.log("feedback err", error);
        
    }
}

module.exports={feedback}