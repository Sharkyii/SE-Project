"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, env_1.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.pool.connect();
    try {
        const _a = req.body, { email, password, role, name } = _a, profileData = __rest(_a, ["email", "password", "role", "name"]);
        const userExists = yield client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            res.status(400);
            throw new Error('User already exists');
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield client.query('BEGIN');
        const userRes = yield client.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id', [email, hashedPassword, role]);
        const userId = userRes.rows[0].id;
        if (role === 'student') {
            const { rollNumber, department, semester } = profileData;
            const studentRes = yield client.query('INSERT INTO students (user_id, name, roll_number, department, semester) VALUES ($1, $2, $3, $4, $5) RETURNING id', [userId, name, rollNumber, department, semester || 1]);
            yield client.query('UPDATE users SET profile_id = $1 WHERE id = $2', [studentRes.rows[0].id, userId]);
        }
        else if (role === 'faculty') {
            const { department, designation } = profileData;
            const facultyRes = yield client.query('INSERT INTO faculty (user_id, name, department, designation) VALUES ($1, $2, $3, $4) RETURNING id', [userId, name, department, designation]);
            yield client.query('UPDATE users SET profile_id = $1 WHERE id = $2', [facultyRes.rows[0].id, userId]);
        }
        yield client.query('COMMIT');
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        yield client.query('ROLLBACK');
        next(error);
    }
    finally {
        client.release();
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield db_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            const token = generateToken(user.id, user.role);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: env_1.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.json({ id: user.id, email: user.email, role: user.role });
        }
        else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const logout = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};
exports.logout = logout;
const getMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT id, email, role, profile_id FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getMe = getMe;
