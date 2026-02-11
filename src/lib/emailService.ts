import { Resend } from 'resend';
import {
  getOrderConfirmationEmail,
  getOrderShippedEmail,
  getOrderDeliveredEmail,
  getWelcomeEmail,
  getContactFormEmail,
} from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'contact@onlyinkani.in',
      to: 'contact@onlyinkani.in',
      replyTo: contactData.email,
      subject: `Contact Form: ${contactData.subject}`,
      html: getContactFormEmail(contactData),
    });

    if (error) {
      console.error('Error sending contact form email:', error);
      return { success: false, error };
    }

    console.log('✅ Contact form email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}