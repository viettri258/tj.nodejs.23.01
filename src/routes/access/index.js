"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandle } = require("../../auth/checkAuth");

// signUp
router.post("/shop/signup", asyncHandle(AccessController.signUp));

module.exports = router;
