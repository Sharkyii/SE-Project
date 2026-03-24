"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const roleGuard_1 = require("../middlewares/roleGuard");
const studentController_1 = require("../controllers/studentController");
const router = express_1.default.Router();
router.use(auth_1.protect);
router.use((0, roleGuard_1.authorize)('student'));
router.post('/documents', studentController_1.uploadDocuments);
router.post('/pay-fee', studentController_1.payFee);
router.post('/electives', studentController_1.chooseElectives);
router.get('/grades', studentController_1.viewGrades);
router.post('/feedback', studentController_1.submitFeedback);
router.get('/leaderboard', studentController_1.getLeaderboard);
exports.default = router;
