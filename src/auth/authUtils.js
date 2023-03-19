"use strict";

const JWT = require("jsonwebtoken");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { asyncHandler } = require("../helpers/asyncHandler");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });

        //

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error("error verify::", err);
            } else {
                console.log("decode verify::", decode);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {
        // return error
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /**
     * Khi login, FE nên đưa cả userId, token vào header, ko cần phải accesstoken
     * 1. check userId missing ???
     * 2. get accessToken
     * 3. verifyToken
     * 4. check user in dbs
     * 5. check keyStore with this userId
     * 6. OK all -> return next
     */

    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid Request");

    // 2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");

    // 3. verifyToken
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Header is not defined");

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        console.log({ decodeUser });
        if (userId !== decodeUser.userId)
            throw new AuthFailureError("Invalid User");
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
});

module.exports = {
    createTokenPair,
    authentication,
};

/**
 * FE cần truyền
 * API Key
 * Client userId
 * Access Token
 *
 * Khi login
 *  FE Phải truyền luôn cả RT
 *  Nếu có RT có nghĩa là người dùng login lại (trên thiết bị đó) -> chỉ remove keyStore của RT tương ứng
 *  Nếu không có RT thì đây là lần login đầu tiên (trên thiết bị mới) -> tạo một keyStore mới
 * Khi logout:
 * Có 2 tuỳ chọn: logout và logout all
 *  - Logout: truyền thêm RT -> chỉ remove 1 keyStore tương ứng
 *  - Lougout All -> remove tất cả keyStore của userId
 */
