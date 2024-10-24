require('dotenv').config();
const {connectDB} = require("./DataBase/DB");
const {app} = require("./app");


const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
   app.listen(PORT ,  () => console.log(`server is running on http://localhost:${PORT}`));
})
.catch((err) => {
    console.log("MongoDB connection ERROR : ", err);
    
});


