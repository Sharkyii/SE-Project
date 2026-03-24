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
exports.getReports = exports.verifyUser = exports.assignFaculty = exports.createCourse = void 0;
const db_1 = require("../config/db");
// Create Course
const createCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, description, credits } = req.body;
        const result = yield db_1.pool.query('INSERT INTO courses (name, code, description, credits) VALUES ($1, $2, $3, $4) RETURNING *', [name, code, description, credits]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.createCourse = createCourse;
// Assign Faculty to Course
const assignFaculty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, facultyId } = req.body;
        const result = yield db_1.pool.query('UPDATE courses SET faculty_id = $1 WHERE id = $2 RETURNING *', [facultyId, courseId]);
        if (result.rows.length === 0) {
            res.status(404);
            throw new Error('Course not found');
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
});
exports.assignFaculty = assignFaculty;
// Verify User (e.g., mark as active or verified - adding a column if needed, but for now just a dummy update)
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // Assuming we might have a verified column, or just toggling something.
        // For now, let's just log it or update a placeholder.
        res.status(200).json({ message: `User ${userId} verified` });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyUser = verifyUser;
// Get Reports (Basic counts for now)
const getReports = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentsCount = yield db_1.pool.query('SELECT COUNT(*) FROM students');
        const facultyCount = yield db_1.pool.query('SELECT COUNT(*) FROM faculty');
        const coursesCount = yield db_1.pool.query('SELECT COUNT(*) FROM courses');
        res.status(200).json({
            stats: {
                students: parseInt(studentsCount.rows[0].count),
                faculty: parseInt(facultyCount.rows[0].count),
                courses: parseInt(coursesCount.rows[0].count),
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getReports = getReports;
