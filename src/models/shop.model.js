"use strict";

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const shopSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            maxLength: 150,
        },
        email: {
            type: String,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive",
        },
        verify: {
            type: Boolean,
            default: false,
        },
        roles: {
            type: Array,
            default: [],
        },
    },
    {
        collection: "shops",
        timestamps: true,
    },
);

module.exports = {
    _Shop: model("Shop", shopSchema),
};
