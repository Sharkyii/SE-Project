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
const emailService_1 = require("../services/emailService");
const generateToken = (id, role, email) => {
    return jsonwebtoken_1.default.sign({ id, role, email }, env_1.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { email, password, role, name } = _a, profileData = __rest(_a, ["email", "password", "role", "name"]);
        const { data: userExists } = yield db_1.supabase.from('users').select('*').eq('email', email).single();
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Supabase SDK doesn't support basic transactions across tables directly without RPC,
        // so we do sequential inserts.
        const { data: userRes, error: userError } = yield db_1.supabase
            .from('users')
            .insert([{ email, password: hashedPassword, role }])
            .select()
            .single();
        if (userError)
            throw userError;
        const userId = userRes.id;
        if (role === 'student') {
            const { rollNumber, department, semester } = profileData;
            const { data: studentRes, error: studentError } = yield db_1.supabase
                .from('students')
                .insert([{ user_id: userId, name, roll_number: rollNumber, department, semester: semester || 1 }])
                .select()
                .single();
            if (studentError)
                throw studentError;
            yield db_1.supabase.from('users').update({ profile_id: studentRes.id }).eq('id', userId);
            // Send welcome email to student
            try {
                const emailContent = emailService_1.emailTemplates.newStudentCredentials(name, email, password, rollNumber);
                yield (0, emailService_1.sendEmail)(Object.assign({ to: email }, emailContent));
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }
        }
        else if (role === 'faculty') {
            const { department, designation } = profileData;
            const { data: facultyRes, error: facultyError } = yield db_1.supabase
                .from('faculty')
                .insert([{ user_id: userId, name, department, designation }])
                .select()
                .single();
            if (facultyError)
                throw facultyError;
            yield db_1.supabase.from('users').update({ profile_id: facultyRes.id }).eq('id', userId);
            // Send welcome email to faculty
            try {
                const emailContent = emailService_1.emailTemplates.newFacultyCredentials(name, email, password, department);
                yield (0, emailService_1.sendEmail)(Object.assign({ to: email }, emailContent));
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }
        }
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { data: user, error } = yield db_1.supabase.from('users').select('*').eq('email', email).single();
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            const token = generateToken(user.id, user.role, user.email);
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
        const { data: user, error } = yield db_1.supabase
            .from('users')
            .select('id, email, role, profile_id')
            .eq('id', req.user.id)
            .single();
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
