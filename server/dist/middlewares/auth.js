"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const protect = (req, res, next) => {
    var _a;
    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // Also support Bearer token from Authorization header
    if (!token && ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith('Bearer '))) {
        const bearer = req.headers.authorization.split(' ')[1];
        // Only accept if it's not the mock token
        if (bearer && bearer !== 'cookie-auth') {
            token = bearer;
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
};
exports.protect = protect;
