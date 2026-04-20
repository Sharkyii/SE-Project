const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: '9e5e23001@smtp-brevo.com',
      pass: 'xsmtpsib-93939b0f55e77733651ab1d06e9fe747009dd30940001e68367cc933af4433ad-0nLvLFMKyZz92qia'
    }
  });

  try {
    console.log('📧 Sending welcome email to bms_2024026@iiitm.ac.in...\n');
    
    const info = await transporter.sendMail({
      from: '"University Management System" <9e5e23001@smtp-brevo.com>',
      to: 'bms_2024026@iiitm.ac.in',
      subject: 'Welcome to University - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to University Management System!</h2>
          <p>Dear Student,</p>
          <p>Your student account has been successfully created. Here are your login credentials:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> bms_2024026@iiitm.ac.in</p>
            <p><strong>Password:</strong> test123</p>
            <p><strong>Roll Number:</strong> BMS_2024026</p>
          </div>
          <p style="color: #dc2626;"><strong>Important:</strong> Please change your password after your first login.</p>
          <p>Login at: <a href="http://localhost:5173/auth">http://localhost:5173/auth</a></p>
          <p>Best regards,<br>University Administration</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n📥 CHECK YOUR EMAIL NOW!');
    console.log('📧 Email: bms_2024026@iiitm.ac.in');
    console.log('\n⚠️  IMPORTANT: Check these folders:');
    console.log('   1. Inbox');
    console.log('   2. Spam/Junk folder');
    console.log('   3. Promotions tab (if Gmail)');
    console.log('   4. Updates tab (if Gmail)');
    console.log('\n⏰ Email may take 1-5 minutes to arrive\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

sendTestEmail();
