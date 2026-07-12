import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('SMTP not configured — OTP email not sent')
    return false
  }

  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@portfolio.com'
    await transporter.sendMail({
      from: `"Admin Portal" <${from}>`,
      to,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Password Reset OTP</h2>
          <p style="color: #555; font-size: 14px;">Use the following code to reset your admin password:</p>
          <div style="background: #0f121d; border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #06b6d4; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 12px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (err) {
    console.error('Failed to send OTP email:', err)
    return false
  }
}
