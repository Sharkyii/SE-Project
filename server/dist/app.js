"use strict";
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
// Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
