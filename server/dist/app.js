"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middlewares/errorHandler");
// Import Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const faculty_routes_1 = __importDefault(require("./routes/faculty.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const fee_routes_1 = __importDefault(require("./routes/fee.routes"));
const enrollment_routes_1 = __importDefault(require("./routes/enrollment.routes"));
const exam_routes_1 = __importDefault(require("./routes/exam.routes"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
const placement_routes_1 = __importDefault(require("./routes/placement.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/faculty', faculty_routes_1.default);
app.use('/api/student', student_routes_1.default);
app.use('/api/fees', fee_routes_1.default);
app.use('/api/enrollments', enrollment_routes_1.default);
app.use('/api/exams', exam_routes_1.default);
app.use('/api/chatbot', chatbot_1.default);
app.use('/api/placements', placement_routes_1.default);
// Health Check
app.get('/', (req, res) => {
    res.send('Academic ERP API is running...');
});
// Email Test Route (remove in production)
app.get('/api/test-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sendEmail } = yield Promise.resolve().then(() => __importStar(require('./services/emailService')));
        const to = req.query.to || 'bms_2024026@iiitm.ac.in';
        yield sendEmail({
            to,
            subject: 'Server Email Test',
            html: `<h2>✅ Server email is working!</h2><p>Sent at: ${new Date().toLocaleString()}</p>`
        });
        res.json({ success: true, message: `Email sent to ${to}` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}));
// Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
