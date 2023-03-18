"use strict";

const _ = require("lodash");
const crypto = require("crypto");

// lodash trả lại các field dữ liệu cho client
const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};

const generateKeyToken = () => {
    return {
        privateKey: crypto.randomBytes(64).toString("hex"),
        publicKey: crypto.randomBytes(64).toString("hex"),
    };
};

module.exports = {
    getInfoData,
    generateKeyToken,
};
