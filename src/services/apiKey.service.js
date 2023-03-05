"use strict";

const crypto = require("crypto");
const { _ApiKey } = require("../models/apiKey.model");

const findById = async (key) => {
    // const newKey = await _ApiKey.create({
    //     key: crypto.randomBytes(64).toString("hex"),
    //     permissions: ["0000"],
    // });
    // console.log(newKey);
    const objKey = await _ApiKey.findOne({ key, status: true }).lean();
    return objKey;
};

module.exports = {
    findById,
};
