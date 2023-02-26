require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
checkOverload();

// init routes
app.get("/", (req, res, next) => {
    const strCompress = "Hello Fantipjs";

    return res.status(200).json({
        message: "Welcome Fantipjs",
        // metadata: strCompress.repeat(10000),
    });
});

module.exports = app;
