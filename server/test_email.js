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
const emailService_1 = require("./src/services/emailService");
/**
 * Test script for email service
 * Run with: npx ts-node test_email.ts
 */
function testEmailService() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Email Service...\n');
        // Replace with your test email
        const testEmail = 'your-email@example.com';
        try {
            // Test 1: New Student Credentials
            console.log('📧 Test 1: Sending new student credentials email...');
            const studentEmail = emailService_1.emailTemplates.newStudentCredentials('John Doe', testEmail, 'test123', '2024001');
            yield (0, emailService_1.sendEmail)(Object.assign({ to: testEmail }, studentEmail));
            console.log('✅ Student credentials email sent successfully!\n');
            // Test 2: Fee Receipt Submitted
            console.log('📧 Test 2: Sending fee receipt confirmation...');
            const feeEmail = emailService_1.emailTemplates.feeReceiptSubmitted('John Doe', 'Academic Fee', '₹50,000');
            yield (0, emailService_1.sendEmail)(Object.assign({ to: testEmail }, feeEmail));
            console.log('✅ Fee receipt confirmation sent successfully!\n');
            // Test 3: Quiz Assignment
            console.log('📧 Test 3: Sending quiz assignment notification...');
            const quizEmail = emailService_1.emailTemplates.quizAssignment('John Doe', 'Data Structures', 'Mid-term Quiz', '2024-05-15', 'Dr. Smith');
            yield (0, emailService_1.sendEmail)(Object.assign({ to: testEmail }, quizEmail));
            console.log('✅ Quiz assignment notification sent successfully!\n');
            // Test 4: Grade Published
            console.log('📧 Test 4: Sending grade publication notification...');
            const gradeEmail = emailService_1.emailTemplates.gradePublished('John Doe', 'Data Structures', 'A', 'Fall 2024');
            yield (0, emailService_1.sendEmail)(Object.assign({ to: testEmail }, gradeEmail));
            console.log('✅ Grade publication notification sent successfully!\n');
            // Test 5: Class Cancelled
            console.log('📧 Test 5: Sending class cancellation notice...');
            const cancelEmail = emailService_1.emailTemplates.classCancelled('John Doe', 'Data Structures', '2024-05-10', '10:00 AM - 11:00 AM', 'Faculty on leave');
            yield (0, emailService_1.sendEmail)(Object.assign({ to: testEmail }, cancelEmail));
            console.log('✅ Class cancellation notice sent successfully!\n');
            console.log('🎉 All email tests completed successfully!');
            console.log(`\n📬 Check your inbox at: ${testEmail}`);
        }
        catch (error) {
            console.error('❌ Email test failed:', error);
            process.exit(1);
        }
    });
}
// Run tests
testEmailService();
