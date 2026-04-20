import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Get email configuration from environment variables
const EMAIL_FROM = process.env.EMAIL_FROM || 'snehkansagara@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'University Management System';

// Brevo SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '9e5e23001@smtp-brevo.com',
    pass: 'xsmtpsib-93939b0f55e77733651ab1d06e9fe747009dd30940001e68367cc933af4433ad-0nLvLFMKyZz92qia'
  }
});

export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  console.log(`📧 Attempting to send email to: ${to}`);
  try {
    const info = await transporter.sendMail({
      from: '"University Management System" <snehkansagara@gmail.com>',
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to} | Subject: ${subject} | MsgID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  newStudentCredentials: (name: string, email: string, password: string, rollNumber: string) => ({
    subject: 'Welcome to University - Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to University Management System!</h2>
        <p>Dear ${name},</p>
        <p>Your student account has been successfully created. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Roll Number:</strong> ${rollNumber}</p>
        </div>
        <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after your first login.</p>
        <p>Login at: <a href="${env.CLIENT_URL}/auth">${env.CLIENT_URL}/auth</a></p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  }),

  newFacultyCredentials: (name: string, email: string, password: string, department: string) => ({
    subject: 'Welcome to University - Faculty Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to University Management System!</h2>
        <p>Dear ${name},</p>
        <p>Your faculty account has been successfully created. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Department:</strong> ${department}</p>
        </div>
        <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after your first login.</p>
        <p>Login at: <a href="${env.CLIENT_URL}/auth">${env.CLIENT_URL}/auth</a></p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  }),

  quizAssignment: (studentName: string, courseName: string, title: string, dueDate: string, facultyName: string) => ({
    subject: `New Assignment: ${title} - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Assignment Posted</h2>
        <p>Dear ${studentName},</p>
        <p>A new assignment has been posted in your course:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Assignment:</strong> ${title}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Posted by:</strong> ${facultyName}</p>
        </div>
        <p>Please login to view details and submit your work.</p>
        <p><a href="${env.CLIENT_URL}/student/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Assignment</a></p>
        <p>Best regards,<br>University Management System</p>
      </div>
    `
  }),

  feeReceiptSubmitted: (name: string, feeType: string, amount: string) => ({
    subject: 'Fee Receipt Submitted - Pending Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Fee Receipt Submitted Successfully</h2>
        <p>Dear ${name},</p>
        <p>Your fee receipt has been submitted and is pending verification.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Fee Type:</strong> ${feeType}</p>
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Status:</strong> Pending Verification</p>
        </div>
        <p>You will receive a confirmation email once the receipt is verified by the administration.</p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  }),

  feeVerified: (name: string, feeType: string, status: 'approved' | 'rejected') => ({
    subject: `Fee Receipt ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === 'approved' ? '#16a34a' : '#dc2626'};">
          Fee Receipt ${status === 'approved' ? 'Approved' : 'Rejected'}
        </h2>
        <p>Dear ${name},</p>
        <p>Your ${feeType} fee receipt has been ${status}.</p>
        ${status === 'approved' 
          ? '<p style="color: #16a34a;">Your payment has been verified successfully. Thank you!</p>'
          : '<p style="color: #dc2626;">Please contact the administration office for more details or resubmit a valid receipt.</p>'
        }
        <p><a href="${env.CLIENT_URL}/student/fee-management" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Fee Status</a></p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  }),

  classCancelled: (studentName: string, courseName: string, date: string, time: string, reason?: string) => ({
    subject: `Class Cancelled - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Class Cancellation Notice</h2>
        <p>Dear ${studentName},</p>
        <p>The following class has been cancelled:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        <p>Please check your timetable for any updates or rescheduled classes.</p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  }),

  gradePublished: (studentName: string, courseName: string, grade: string, semester: string) => ({
    subject: `Grade Published - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Grade Published</h2>
        <p>Dear ${studentName},</p>
        <p>Your grade for the following course has been published:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Semester:</strong> ${semester}</p>
          <p><strong>Grade:</strong> <span style="font-size: 24px; color: #2563eb;">${grade}</span></p>
        </div>
        <p><a href="${env.CLIENT_URL}/student/grades" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Grades</a></p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  }),

  attendanceAlert: (studentName: string, courseName: string, attendancePercentage: number) => ({
    subject: `Low Attendance Alert - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Attendance Alert</h2>
        <p>Dear ${studentName},</p>
        <p>Your attendance in the following course is below the required threshold:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Current Attendance:</strong> ${attendancePercentage}%</p>
          <p><strong>Required:</strong> 75%</p>
        </div>
        <p style="color: #dc2626;">Please ensure regular attendance to meet the minimum requirement.</p>
        <p>Best regards,<br>University Administration</p>
      </div>
    `
  })
};
