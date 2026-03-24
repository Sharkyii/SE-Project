"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const roleGuard_1 = require("../middlewares/roleGuard");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
// All routes require login and 'admin' role
router.use(auth_1.protect);
router.use((0, roleGuard_1.authorize)('admin'));
router.post('/courses', adminController_1.createCourse);
router.post('/assign-faculty', adminController_1.assignFaculty);
router.post('/verify-user', adminController_1.verifyUser);
router.get('/reports', adminController_1.getReports);
exports.default = router;
