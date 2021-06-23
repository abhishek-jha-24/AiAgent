var express = require("express");
var authRouter = require("./auth");
var userRouter = require("./user");
var assetRouter = require('./asset');

var app = express();

// app.use("/auth/", authRouter);
app.use("/user/", userRouter);
app.use('/assets',assetRouter);

module.exports = app;
