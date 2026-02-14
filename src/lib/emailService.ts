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

const getAdminNotificationEmails = (): string[] => {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS || process.env.EMAIL_FROM || '';
  const emails = raw
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  return emails.length > 0 ? emails : ['contact@onlyinkani.in'];
};

export async function sendOrderConfirmationEmail(order: any) {
  try {
    const email = order.guestEmail || order.user?.email;
    if (!email) {
      console.error('No email found for order:', order.id);
      return { success: false, error: 'No email found' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: email,
      subject: `Order Confirmation - Order #${order.id.substring(0, 8)}`,
      html: getOrderConfirmationEmail(order),
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error };
    }

    console.log('✅ Order confirmation email sent:', data);
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
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: email,
      subject: `Order Shipped - Order #${order.id.substring(0, 8)}`,
      html: getOrderShippedEmail(order),
    });

    if (error) {
      console.error('Error sending shipped email:', error);
      return { success: false, error };
    }

    console.log('✅ Order shipped email sent:', data);
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
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: email,
      subject: `Order Delivered - Order #${order.id.substring(0, 8)}`,
      html: getOrderDeliveredEmail(order),
    });

    if (error) {
      console.error('Error sending delivered email:', error);
      return { success: false, error };
    }

    console.log('✅ Order delivered email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(user: any) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: user.email,
      subject: 'Welcome to E-Store!',
      html: getWelcomeEmail(user),
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('✅ Welcome email sent:', data);
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
    // Validate input
    if (!contactData.email || !contactData.name || !contactData.subject || !contactData.message) {
      console.error('Missing required contact form data');
      return { success: false, error: 'Missing required fields' };
    }

    // Send email to business inbox
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: process.env.EMAIL_FROM || 'contact@onlyinkani.in', // Send to business email
      replyTo: contactData.email, // Reply goes to customer
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: getContactFormEmail(contactData),
    });

    if (error) {
      console.error('Error sending contact form email to business:', error);
      return { success: false, error };
    }

    console.log('✅ Contact form email sent to business:', data);
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
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: user.email,
      subject: 'Verify Your Email - E-Store',
      html: getVerificationEmail(user, verificationUrl),
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error };
    }

    console.log('✅ Verification email sent:', data);
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
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to,
      subject: `New User Registered - ${user.email}`,
      html: getAdminNewUserEmail(user),
    });

    if (error) {
      console.error('Error sending admin new user email:', error);
      return { success: false, error };
    }

    console.log('✅ Admin new user email sent:', data);
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
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to,
      subject: `New Order Received - ${order.id.substring(0, 8)}`,
      html: getAdminNewOrderEmail(order),
    });

    if (error) {
      console.error('Error sending admin new order email:', error);
      return { success: false, error };
    }

    console.log('✅ Admin new order email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin new order email:', error);
    return { success: false, error };
  }
}