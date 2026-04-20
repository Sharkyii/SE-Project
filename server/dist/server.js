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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
dns_1.default.setDefaultResultOrder('verbatim');
const PORT = env_1.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Attempting to connect to database...');
        yield (0, db_1.connectDB)();
        console.log('Database connected successfully');
        const server = app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        // Keep process alive
        server.on('error', (err) => {
            console.error('Server error:', err);
        });
        process.on('SIGINT', () => {
            console.log('Shutting down...');
            server.close(() => process.exit(0));
        });
        process.on('SIGTERM', () => {
            server.close(() => process.exit(0));
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});
startServer();
