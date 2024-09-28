const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const {authRouter} = require("./routes/userAuth");


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "25kb"}));
app.use(express.static("public"));
app.use(cookieParser());


app.use("/user" , authRouter)


module.exports = {app};