const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true, 
    methods: ['GET', 'POST','PATCH','PUT','DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.options('*', cors(corsOptions));

app.use(cors(corsOptions));


app.use(express.json({ limit: "100mb" }));  
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));



const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const videoRouter = require("./routes/videoRoutes");
const commentRouter = require("./routes/commentRoutes");
const likeRouter = require("./routes/likeRoutes");
const playlistRouter = require("./routes/playlistRoutes");
const subscriptionRouter = require("./routes/subscriptionRoutes");

const feedbackRouter = require('./routes/feedback')


app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/video", videoRouter);
app.use("/comment", commentRouter);
app.use("/like", likeRouter);
app.use("/playlist", playlistRouter);
app.use("/subscription", subscriptionRouter);

app.use("/feedback", feedbackRouter)

module.exports = { app };
