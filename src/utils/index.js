"use strict";

const _ = require("lodash");

// lodash trả lại các field dữ liệu cho client
const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};

module.exports = {
    getInfoData,
};
