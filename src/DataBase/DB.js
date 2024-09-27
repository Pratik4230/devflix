require('dotenv').config();
const mongoose = require("mongoose");


const connectDB = async () => {
   try {
    await mongoose.connect(process.env.DB_URL);
    console.log("DB Connected Successfully !!!");
    
   } catch (error) {
    console.log("DB connection Failed !!! : " , error);
    
   }  
};

module.exports = {connectDB};