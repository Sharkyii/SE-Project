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
exports.applyLeave = exports.postQuiz = exports.uploadGrades = exports.markAttendance = void 0;
const db_1 = require("../config/db");
const markAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, courseId, date, status } = req.body;
        const result = yield db_1.pool.query('INSERT INTO attendance (student_id, course_id, date, status) VALUES ($1, $2, $3, $4) RETURNING *', [studentId, courseId, date, status]);
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.markAttendance = markAttendance;
const uploadGrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, courseId, examType, score, maxScore } = req.body;
        const result = yield db_1.pool.query('INSERT INTO grades (student_id, course_id, exam_type, score, max_score) VALUES ($1, $2, $3, $4, $5) RETURNING *', [studentId, courseId, examType, score, maxScore]);
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadGrades = uploadGrades;
const postQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(201).json({ message: 'Quiz functionality to be implemented with specialized table' });
    }
    catch (error) {
        next(error);
    }
});
exports.postQuiz = postQuiz;
const applyLeave = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(201).json({ message: 'Leave application submitted' });
    }
    catch (error) {
        next(error);
    }
});
exports.applyLeave = applyLeave;
