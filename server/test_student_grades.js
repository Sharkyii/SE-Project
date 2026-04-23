"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
const token = jsonwebtoken_1.default.sign({ id: 58, role: 'student', email: 'demo.student@iiitm.ac.in' }, process.env.JWT_SECRET || 'fallback', { expiresIn: '30d' });
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/student/grades',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};
const req = http_1.default.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
});
req.on('error', e => console.error('Error:', e));
req.end();
