import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTP(toEmail: string, code: string) {
  const mailOptions = {
    from: `"CrewSync Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your CrewSync Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 24px; color: #333;">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 24px;">Welcome to CrewSync!</h2>
        <p>Hello,</p>
        <p>Please use the verification code below to complete your registration:</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <h1 style="font-size: 36px; letter-spacing: 4px; color: #0f172a; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; ${new Date().getFullYear()} CrewSync. All rights reserved.</p>
      </div>
    `,
  };

  console.log(`\n🔑 [MOCK EMAIL] To: ${toEmail} | OTP Code: ${code} \n`);

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP Email successfully sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error(`\n❌ Error sending OTP email:\n`, error.message);
    return true; 
  }
}

export async function sendGoogleWelcomeEmail(toEmail: string, name: string) {
  const mailOptions = {
    from: `"CrewSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to CrewSync! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 24px; color: #333;">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 24px;">Registration Successful!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for signing up with Google! Your email <strong>${toEmail}</strong> has been automatically verified by Google's secure OAuth system.</p>
        <p>You can now log in securely without entering any passwords using the "Continue with Google" button.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; ${new Date().getFullYear()} CrewSync. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome Email successfully sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error(`\n❌ Error sending Welcome email:\n`, error.message);
    return false; 
  }
}
