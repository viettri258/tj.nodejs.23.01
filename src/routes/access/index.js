"use strict";

const express = require("express");
const { authentication } = require("../../auth/authUtils");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");

// signUp
router.post("/shop/signup", asyncHandler(AccessController.signUp));
router.post("/shop/login", asyncHandler(AccessController.login));

// authentication //
router.use(authentication);
/////
router.post("/shop/logout", asyncHandler(AccessController.logout));

module.exports = router;
