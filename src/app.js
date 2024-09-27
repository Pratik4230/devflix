const express = require("express");

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "25kb"}));
app.use(express.urlencoded({extended: true, limit: "25kb"}));
app.use(express.static("public"));
app.use(cookieParser());



module.exports = {app};