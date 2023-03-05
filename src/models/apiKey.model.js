"use strict";

const { Schema, model } = require("mongoose");

const apiKeySchema = new Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
        permissions: {
            type: [String],
            required: true,
            enum: ["0000", "1111", "2222"],
        },
    },
    {
        timestamps: true,
        collection: "apiKeys",
    },
);

module.exports = {
    _ApiKey: model("ApiKey", apiKeySchema),
};
