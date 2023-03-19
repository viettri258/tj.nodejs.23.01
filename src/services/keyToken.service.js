"use strict";

const { _KeyToken } = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            // const tokens = await _KeyToken.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // });
            // return tokens ? tokens.publicKey : null;
            const filter = { user: userId };
            const update = {
                publicKey,
                privateKey,
                refreshToken,
                refreshTokensUsed: [],
            };
            const options = { upsert: true, new: true };
            const tokens = await _KeyToken.findOneAndUpdate(
                filter,
                update,
                options,
            );

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };

    static findByUserId = async (userId) => {
        return await _KeyToken
            .findOne({
                user: Types.ObjectId(userId),
            })
            .lean();
    };

    static removeKeyById = async (id) => {
        return await _KeyToken.remove({ _id: id });
    };
}

module.exports = KeyTokenService;
