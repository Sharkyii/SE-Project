"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const roleGuard_1 = require("../middlewares/roleGuard");
const facultyController_1 = require("../controllers/facultyController");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use((0, roleGuard_1.authorize)('faculty'));
router.post('/attendance', facultyController_1.markAttendance);
router.post('/grades', facultyController_1.uploadGrades);
router.post('/quizzes', facultyController_1.postQuiz);
router.post('/leave', facultyController_1.applyLeave);
exports.default = router;
