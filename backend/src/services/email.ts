import nodemailer from 'nodemailer';

// Mock transporter - logs instead of sending
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'mock@example.com',
    pass: process.env.SMTP_PASS || 'mockpassword',
  },
});

interface SendPasswordResetEmailParams {
  to: string;
  firstName: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetUrl
}: SendPasswordResetEmailParams) {
  // STUB: Log instead of sending email
  console.log('[EMAIL STUB] Password reset email would be sent to:', to);
  console.log('[EMAIL STUB] Reset URL:', resetUrl);
  return { success: true };
}

export async function sendQuoteEmail({
  to,
  clientName,
  quoteNumber,
  totalPrice,
  loginUrl
}: {
  to: string;
  clientName: string;
  quoteNumber: string;
  totalPrice: number;
  loginUrl: string;
}) {
  // STUB: Log instead of sending email
  console.log('[EMAIL STUB] Quote email would be sent to:', to);
  console.log('[EMAIL STUB] Quote #', quoteNumber, 'for $', totalPrice);
  return { success: true, messageId: 'mock-message-id' };
}

export default transporter;
