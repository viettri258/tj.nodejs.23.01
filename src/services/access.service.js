"use strict";

const { _Shop } = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");

const RoleShop = {
    SHOP: "SHOP",
    WRITE: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        // try {
        // step 1: check email exists???
        const holderShop = await _Shop
            .findOne({
                email,
            })
            .lean();
        if (holderShop) {
            throw new BadRequestError("Shop already registered!");
            // return {
            //     code: "xxxx",
            //     message: "Shop already registered!",
            // };
        }

        const passwordHash = await bycrypt.hash(password, 10);
        const newShop = await _Shop.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });

        if (newShop) {
            // created privateKey, publicKey
            // const { privateKey, publicKey } = crypto.generateKeyPairSync(
            //     "rsa",
            //     {
            //         modulusLength: 4096,
            //         publicKeyEncoding: {
            //             type: "pkcs1", // Public key cruptoGraphy Standards!
            //             format: "pem",
            //         },
            //         privateKeyEncoding: {
            //             type: "pkcs1",
            //             format: "pem",
            //         },
            //     },
            // );
            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");

            console.log({ privateKey, publicKey }); // save collection keyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError("KeyStore error");
                // return {
                //     code: "xxxx",
                //     message: "keyStore error",
                // };
            }

            // create token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey,
            );
            console.log("Create Token Success", tokens);

            return {
                shop: getInfoData({
                    fields: ["_id", "name", "email"],
                    object: newShop,
                }),
                tokens,
            };
        }

        return null;
        // } catch (error) {
        //     return {
        //         code: "xxx",
        //         message: error.message,
        //         status: "error",
        //     };
        // }
    };
}

module.exports = AccessService;
