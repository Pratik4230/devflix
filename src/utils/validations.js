
const validator = require("validator");

const ValidateSignUpData = (req) => {    
  
    const { password,userName , emailId , channelName} = req.body;

   if (!userName || !password  || !emailId || !channelName) {
       throw new Error("All fields are required");
   }else if(!validator.isEmail(emailId)){
    throw new Error("Email is not Valid")
   }else if(!validator.isStrongPassword(password)){
    throw new Error("Please enter strong Password")
   }

   return true;
   }

const ValidateLogInData = (req) => {    
  
    const { password, emailId } = req.body;

   if (!password  || !emailId ) {
       throw new Error("All fields are required");
   }else if(!validator.isEmail(emailId) ){
    throw new Error("Enter valid email")
   }

   return true;
   }

   module.exports={ValidateSignUpData , ValidateLogInData}