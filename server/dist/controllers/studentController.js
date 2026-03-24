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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.submitFeedback = exports.viewGrades = exports.chooseElectives = exports.payFee = exports.uploadDocuments = void 0;
const db_1 = require("../config/db");
const uploadDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ message: 'Document upload functionality to be linked with storage service' });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadDocuments = uploadDocuments;
const payFee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ message: 'Fee payment successful' });
    }
    catch (error) {
        next(error);
    }
});
exports.payFee = payFee;
const chooseElectives = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, semester, academicYear } = req.body;
        const result = yield db_1.pool.query('INSERT INTO enrollments (student_id, course_id, semester, academic_year) VALUES ($1, $2, $3, $4) RETURNING *', [req.user.profile_id, courseId, semester, academicYear]);
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.chooseElectives = chooseElectives;
const viewGrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT g.*, c.name as course_name FROM grades g JOIN courses c ON g.course_id = c.id WHERE g.student_id = $1', [req.user.profile_id]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
exports.viewGrades = viewGrades;
const submitFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facultyId, courseId, semester, rating, comments } = req.body;
        const result = yield db_1.pool.query('INSERT INTO feedback (student_id, faculty_id, course_id, semester, rating, comments) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.user.profile_id, facultyId, courseId, semester, rating, comments]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.submitFeedback = submitFeedback;
const getLeaderboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT l.*, s.name FROM leaderboard l JOIN students s ON l.student_id = s.id ORDER BY l.gpa DESC LIMIT 10');
        res.status(200).json(result.rows);
    }
    catch (error) {
        next(error);
    }
});
exports.getLeaderboard = getLeaderboard;
