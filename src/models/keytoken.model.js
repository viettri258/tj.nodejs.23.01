"use strict";

const { Schema, model } = require("mongoose");

const keyTokenSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Shop",
        },
        publicKey: {
            type: String,
            required: true,
        },
        privateKey: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
        refreshTokensUsed: {
            type: Array,
            default: [], // Những RT đã được sử dụng
        },
    },
    {
        collection: "keys",
        timestamps: true,
    },
);

module.exports = {
    _KeyToken: model("KeyToken", keyTokenSchema),
};
