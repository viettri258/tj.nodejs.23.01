"use strict";

const { findById } = require("../services/apiKey.service");

const HEADER = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }

        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden Error",
            });
        }
        // console.log("objKey::::", objKey);
        req.objKey = objKey;
        return next();
    } catch (error) {
        //
    }
};

const permission = (permission) => {
    return (req, res, next) => {
        // console.log(req.objKey);
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: "permission denied",
            });
        }

        // console.log("permissions:::", req.objKey.permissions);

        const validPermission = req.objKey.permissions.includes(permission);
        if (!validPermission) {
            return res.status(403).json({
                message: "permission denied",
            });
        }

        return next();
    };
};

module.exports = {
    apiKey,
    permission,
};
