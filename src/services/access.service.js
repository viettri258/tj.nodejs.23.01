"use strict";

const { _Shop } = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");

const RoleShop = {
    SHOP: "SHOP",
    WRITE: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            // step 1: check email exists???
            const holderShop = await _Shop
                .findOne({
                    email,
                })
                .lean();
            if (holderShop) {
                return {
                    code: "xxxx",
                    message: "Shop already registered!",
                };
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
                const { privateKey, publicKey } = crypto.generateKeyPairSync(
                    "rsa",
                    {
                        modulusLength: 4096,
                        publicKeyEncoding: {
                            type: "pkcs1", // Public key cruptoGraphy Standards!
                            format: "pem",
                        },
                        privateKeyEncoding: {
                            type: "pkcs1",
                            format: "pem",
                        },
                    },
                );

                console.log({ privateKey, publicKey }); // save collection keyStore

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                });

                if (!publicKeyString) {
                    return {
                        code: "xxxx",
                        message: "publicKeyString error",
                    };
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString);

                console.log("publicKeyObject::::", publicKeyObject);

                // create token pair
                const tokens = await createTokenPair(
                    { userId: newShop._id, email },
                    publicKeyObject,
                    privateKey,
                );
                console.log("Create Token Success", tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: newShop,
                        tokens,
                    },
                };
            }

            return {
                code: 200,
                metadata: null,
            };
        } catch (error) {
            return {
                code: "xxx",
                message: error.message,
                status: "error",
            };
        }
    };
}

module.exports = AccessService;
