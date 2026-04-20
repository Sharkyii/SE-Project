const nodemailer = require('nodemailer');

// Test email sending with your credentials
async function testEmail() {
  console.log('🧪 Testing Brevo Email Service...\n');

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
    // Test connection
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📧 Sending test email to bms_2024026@iiitm.ac.in...');
    const info = await transporter.sendMail({
      from: '"University Management System" <9e5e23001@smtp-brevo.com>',
      to: 'bms_2024026@iiitm.ac.in',
      subject: 'Test Email - University Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Email System Test</h2>
          <p>Hello!</p>
          <p>This is a test email from your University Management System.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Status:</strong> ✅ Email system is working!</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>If you received this email, the notification system is configured correctly.</p>
          <p>Best regards,<br>University Administration</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n✨ Check your inbox at: bms_2024026@iiitm.ac.in');
    console.log('💡 Also check spam/junk folder if not in inbox\n');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Server response:', error.response);
    }
  }
}

testEmail();
