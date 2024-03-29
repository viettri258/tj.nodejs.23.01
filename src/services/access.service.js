"use strict";

const { _Shop } = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData, generateKeyToken } = require("../utils");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: "SHOP",
    WRITE: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    /**
     *
     * check token used?
     */
    static handlerRefreshToken = async (refreshToken) => {
        // check xem token này đã được sử dụng chưa
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken,
        );
        // nếu có
        if (foundToken) {
            // decode xem mày là thằng nào?
            const { userId, email } = await verifyJWT(
                refreshToken,
                foundToken.privateKey,
            );
            console.log({ userId, email });
            // xoá tất cả token trong keyStore
            await KeyTokenService.deleteKeyByUserId(userId);
            throw new ForbiddenError("Something wrong happend!! Pls relogin");
        }

        // NO, quá ngon
        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken,
        );
        if (!holderToken) throw new AuthFailureError("Shop not registed");

        // verifyToken
        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.privateKey,
        );
        console.log("[2]----", { userId, email });
        // check userId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registed");

        // create 1 cặp mới
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey,
        );

        // update token
        await KeyTokenService.updateKeyToken({
            refreshToken,
            newRefreshToken: tokens.refreshToken,
        });

        return {
            user: { userId, email },
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log({ delKey });
        return delKey;
    };
    /**
     *
     * 1. check email in dbs
     * 2. match password
     * 3. create AT vs RT and save
     * 4. general tokens
     * 5. get data return login
     */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1.
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError("Shop not registed");

        //2.
        const match = bycrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication error");

        //3.
        const { privateKey, publicKey } = generateKeyToken();

        //4. generate tokens
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey,
        );

        await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        });

        // 5.
        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

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

            const userId = newShop._id;
            // create token pair
            const tokens = await createTokenPair(
                { userId, email },
                publicKey,
                privateKey,
            );
            console.log("Create Token Success", tokens);

            const keyStore = await KeyTokenService.createKeyToken({
                userId,
                publicKey,
                privateKey,
                refreshToken: tokens.refreshToken,
            });

            if (!keyStore) {
                throw new BadRequestError("KeyStore error");
            }

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
