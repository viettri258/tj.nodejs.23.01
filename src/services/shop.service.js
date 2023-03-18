"use strict";

const { _Shop } = require("../models/shop.model");

const findByEmail = async ({
    email,
    select = { email: 1, password: 1, name: 1, status: 1, roles: 1 },
}) => {
    return await _Shop.findOne({ email }).select(select).lean();
};

module.exports = {
    findByEmail,
};
