const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "25kb"}));
app.use(express.static("public"));
app.use(cookieParser());


// import routes
const userRouter = require("./routes/userRoutes")
const postRouter = require("./routes/postRoutes")
const videoRouter = require("./routes/videoRoutes")
const commentRouter = require("./routes/commentRoutes")
const likeRouter = require("./routes/likeRoutes")
const playlistRouter = require("./routes/playlistRoutes")


// declaring routes
app.use("/user" , userRouter);
app.use("/post" , postRouter);
app.use("/video", videoRouter)
app.use("/comment", commentRouter)
app.use("/like", likeRouter)
app.use("/playlist", playlistRouter)


module.exports = {app};