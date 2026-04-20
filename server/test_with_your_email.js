const nodemailer = require('nodemailer');

async function testWithYourEmail() {
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
    console.log('📧 Testing with YOUR email as sender...\n');
    
    const info = await transporter.sendMail({
      from: '"IIITM University" <bms_2024026@iiitm.ac.in>',
      replyTo: 'bms_2024026@iiitm.ac.in',
      to: 'bms_2024026@iiitm.ac.in',
      subject: 'Test - Email from Your Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
          <p>Hello!</p>
          <p>This email is being sent FROM: <strong>bms_2024026@iiitm.ac.in</strong></p>
          <p>Using Brevo SMTP relay service.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Sender:</strong> bms_2024026@iiitm.ac.in</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Testing sender configuration</p>
          </div>
          <p>If you receive this, the email system is working with your email as sender!</p>
          <p>Best regards,<br>IIITM University</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 FROM: bms_2024026@iiitm.ac.in');
    console.log('📧 TO: bms_2024026@iiitm.ac.in');
    console.log('\n⚠️  Check your inbox and spam folder!\n');
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error('\n⚠️  Note: Brevo may require sender email verification');
    console.error('   Go to: https://app.brevo.com/senders');
    console.error('   Add and verify: bms_2024026@iiitm.ac.in\n');
  }
}

testWithYourEmail();
