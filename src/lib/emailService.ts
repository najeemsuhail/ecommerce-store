import { Resend } from 'resend';
import {
  getOrderConfirmationEmail,
  getOrderShippedEmail,
  getOrderDeliveredEmail,
  getWelcomeEmail,
  getContactFormEmail,
  getVerificationEmail,
  getAdminNewUserEmail,
  getAdminNewOrderEmail,
} from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);
const TRANSACTIONAL_EMAIL =
  process.env.TRANSACTIONAL_EMAIL_FROM || process.env.EMAIL_FROM || 'info@onlyinkani.in';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL_FROM || 'contact@onlyinkani.in';

const getAdminNotificationEmails = (): string[] => {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS || TRANSACTIONAL_EMAIL;
  const emails = raw
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  return emails.length > 0 ? emails : [TRANSACTIONAL_EMAIL];
};

export async function sendPasswordResetEmail(user: any, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: user.email,
      subject: 'Reset Your Password - onlyinkani.in',
      html: `<p>Hi ${user.name || user.email},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="color: #667eea;">Reset Password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>This link will expire in 1 hour.</p>`,
    });
    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }
    console.log('âœ… Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

export async function sendEmailOtpEmail(user: { email: string; name?: string | null }, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: user.email,
      subject: 'Your Sign-In Code - onlyinkani.in',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="margin:0 0 16px;font-size:24px;color:#0f172a">Your one-time code</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Hi ${user.name || user.email},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Use this code to continue signing in to your account:</p>
        <div style="margin:24px 0;padding:16px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;text-align:center">
          <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#1d4ed8">${otp}</div>
        </div>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.6">This code expires in 10 minutes.</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#475569">If you did not request this code, you can ignore this email.</p>
      </div>`,
    });

    if (error) {
      console.error('Error sending email OTP:', error);
      return { success: false, error };
    }

    console.log('Email OTP sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(order: any) {
  try {
    const email = order.guestEmail || order.user?.email;
    if (!email) {
      console.error('No email found for order:', order.id);
      return { success: false, error: 'No email found' };
    }

    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: email,
      subject: `Order Confirmation - Order #${order.id}`,
      html: getOrderConfirmationEmail(order),
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error };
    }

    console.log('âœ… Order confirmation email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendOrderShippedEmail(order: any) {
  try {
    const email = order.guestEmail || order.user?.email;
    if (!email) {
      console.error('No email found for order:', order.id);
      return { success: false, error: 'No email found' };
    }

    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: email,
      subject: `Order Shipped - Order #${order.id}`,
      html: getOrderShippedEmail(order),
    });

    if (error) {
      console.error('Error sending shipped email:', error);
      return { success: false, error };
    }

    console.log('âœ… Order shipped email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendOrderDeliveredEmail(order: any) {
  try {
    const email = order.guestEmail || order.user?.email;
    if (!email) {
      console.error('No email found for order:', order.id);
      return { success: false, error: 'No email found' };
    }

    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: email,
      subject: `Order Delivered - Order #${order.id}`,
      html: getOrderDeliveredEmail(order),
    });

    if (error) {
      console.error('Error sending delivered email:', error);
      return { success: false, error };
    }

    console.log('âœ… Order delivered email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(user: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: user.email,
      subject: 'Welcome to onlyinkani.in!',
      html: getWelcomeEmail(user),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('âœ… Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    if (!contactData.email || !contactData.name || !contactData.subject || !contactData.message) {
      console.error('Missing required contact form data');
      return { success: false, error: 'Missing required fields' };
    }

    const { data, error } = await resend.emails.send({
      from: CONTACT_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: contactData.email,
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: getContactFormEmail(contactData),
    });

    if (error) {
      console.error('Error sending contact form email to business:', error);
      return { success: false, error };
    }

    console.log('âœ… Contact form email sent to business:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(user: any, verificationToken: string) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to: user.email,
      subject: 'Verify Your Email - onlyinkani.in',
      html: getVerificationEmail(user, verificationUrl),
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error };
    }

    console.log('âœ… Verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNewUserEmail(user: any) {
  try {
    const to = getAdminNotificationEmails();
    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to,
      subject: `New User Registered - ${user.email}`,
      html: getAdminNewUserEmail(user),
    });

    if (error) {
      console.error('Error sending admin new user email:', error);
      return { success: false, error };
    }

    console.log('âœ… Admin new user email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin new user email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNewOrderEmail(order: any) {
  try {
    const to = getAdminNotificationEmails();
    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to,
      subject: `New Order Received - ${order.id}`,
      html: getAdminNewOrderEmail(order),
    });

    if (error) {
      console.error('Error sending admin new order email:', error);
      return { success: false, error };
    }

    console.log('âœ… Admin new order email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin new order email:', error);
    return { success: false, error };
  }
}
