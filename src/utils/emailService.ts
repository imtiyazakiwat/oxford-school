import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetOTPEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Reset Your Password - New Oxford Coaching Classes</title>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c41e3a 0%, #8b1528 100%); padding:30px 20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">New Oxford Coaching Classes</h1>
              <p style="margin:5px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">Jamkhandi & Athani</p>
            </td>
          </tr>
          
          <!-- Welcome Banner -->
          <tr>
            <td style="background:#1e3a5f; padding:20px 40px; text-align:center;">
              <h2 style="margin:0; color:#ffffff; font-size:20px; font-weight:500;">Password Reset Request</h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:35px 40px; color:#374151; font-size:15px; line-height:1.7;">
              <p style="margin:0 0 20px;">Dear User,</p>
              
              <p style="margin:0 0 20px;">We received a request to reset your password for your <strong>New Oxford Coaching Classes Student Portal</strong> account. Please use the verification code below to reset your password:</p>
              
              <!-- OTP Code -->
              <div style="text-align:center; margin:35px 0;">
                <div style="background:#f3f4f6; border-radius:12px; padding:25px; display:inline-block;">
                  <p style="margin:0 0 10px; color:#6b7280; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Your Reset Code</p>
                  <div style="font-size:36px; font-weight:700; letter-spacing:8px; color:#c41e3a; font-family:monospace;">
                    ${otp}
                  </div>
                </div>
              </div>
              
              <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:15px 20px; margin:25px 0; border-radius:0 8px 8px 0;">
                <p style="margin:0; color:#92400e; font-size:14px;">
                  <strong>This code expires in 10 minutes.</strong><br/>
                  Do not share this code with anyone.
                </p>
              </div>
              
              <p style="margin:0 0 15px; color:#6b7280; font-size:13px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p style="margin:25px 0 0;">Best Regards,<br/><strong style="color:#c41e3a;">New Oxford Coaching Classes</strong><br/>
              <span style="color:#6b7280; font-size:13px;">Administration Team</span></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#1e3a5f; padding:25px 40px; text-align:center;">
              <p style="margin:0 0 10px; color:#ffffff; font-size:14px; font-weight:500;">Empowering Minds, Transforming Lives</p>
              <p style="margin:0; color:rgba(255,255,255,0.7); font-size:12px;">
                &copy; 2026 New Oxford Coaching Classes. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"New Oxford Coaching Classes" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `${otp} - Password Reset Code | New Oxford Coaching Classes`,
      html: htmlContent,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: "Failed to send password reset email" };
  }
}

export async function sendOTPEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email - New Oxford Coaching Classes</title>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c41e3a 0%, #8b1528 100%); padding:30px 20px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:600;">New Oxford Coaching Classes</h1>
              <p style="margin:5px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">Jamkhandi & Athani</p>
            </td>
          </tr>
          
          <!-- Welcome Banner -->
          <tr>
            <td style="background:#1e3a5f; padding:20px 40px; text-align:center;">
              <h2 style="margin:0; color:#ffffff; font-size:20px; font-weight:500;">Email Verification</h2>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:35px 40px; color:#374151; font-size:15px; line-height:1.7;">
              <p style="margin:0 0 20px;">Dear Student,</p>
              
              <p style="margin:0 0 20px;">Thank you for registering on the <strong>New Oxford Coaching Classes Student Portal</strong>. Please use the verification code below to complete your registration:</p>
              
              <!-- OTP Code -->
              <div style="text-align:center; margin:35px 0;">
                <div style="background:#f3f4f6; border-radius:12px; padding:25px; display:inline-block;">
                  <p style="margin:0 0 10px; color:#6b7280; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Your Verification Code</p>
                  <div style="font-size:36px; font-weight:700; letter-spacing:8px; color:#c41e3a; font-family:monospace;">
                    ${otp}
                  </div>
                </div>
              </div>
              
              <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:15px 20px; margin:25px 0; border-radius:0 8px 8px 0;">
                <p style="margin:0; color:#92400e; font-size:14px;">
                  <strong>This code expires in 10 minutes.</strong><br/>
                  Do not share this code with anyone.
                </p>
              </div>
              
              <p style="margin:0 0 15px; color:#6b7280; font-size:13px;">If you did not request this verification, please ignore this email.</p>
              
              <p style="margin:25px 0 0;">Best Regards,<br/><strong style="color:#c41e3a;">New Oxford Coaching Classes</strong><br/>
              <span style="color:#6b7280; font-size:13px;">Administration Team</span></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#1e3a5f; padding:25px 40px; text-align:center;">
              <p style="margin:0 0 10px; color:#ffffff; font-size:14px; font-weight:500;">Empowering Minds, Transforming Lives</p>
              <p style="margin:0; color:rgba(255,255,255,0.7); font-size:12px;">
                &copy; 2026 New Oxford Coaching Classes. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"New Oxford Coaching Classes" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: `${otp} - Your Verification Code | New Oxford Coaching Classes`,
      html: htmlContent,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: "Failed to send verification email" };
  }
}
