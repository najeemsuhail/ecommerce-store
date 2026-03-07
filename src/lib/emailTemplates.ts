import { formatPrice, formatPriceRange } from './currency';

export function getOrderConfirmationEmail(order: any) {
  const itemsList = order.items
    .map(
      (item: any) => {
        const priceFormatted = formatPrice(item.price).replace('₹', '').trim();
        const totalFormatted = formatPrice(item.quantity * item.price).replace('₹', '').trim();
        return `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.product.name}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            &#8377;${priceFormatted}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            &#8377;${totalFormatted}
          </td>
        </tr>`;
      }
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        @media only screen and (max-width: 600px) {
          .email-wrapper {
            width: 100% !important;
          }
          .email-padding {
            padding: 16px !important;
          }
          .email-header {
            padding: 20px 16px !important;
          }
          .mobile-text {
            font-size: 14px !important;
          }
          .mobile-table th,
          .mobile-table td {
            padding: 8px 6px !important;
            font-size: 12px !important;
          }
          .mobile-button {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            text-align: center !important;
            padding: 12px 16px !important;
          }
          .mobile-break {
            word-break: break-all !important;
          }
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #eef2f7;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #eef2f7;">
        <tr>
          <td align="center" style="padding: 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-wrapper" style="width: 600px; max-width: 600px; background: #f9f9f9; border-radius: 10px; overflow: hidden;">
              <tr>
                <td class="email-header" style="background: #667eea; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; line-height: 1.3;">Order Confirmed!</h1>
                </td>
              </tr>
              <tr>
                <td class="email-padding" style="padding: 30px;">
                  <p class="mobile-text" style="font-size: 16px; margin-bottom: 20px;">
                    Hi ${order.user?.name || order.guestName || 'Customer'},
                  </p>

                  <p class="mobile-text" style="font-size: 16px; margin-bottom: 20px;">
                    Thank you for your order! We've received your payment and are processing your order.
                  </p>

                  <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> <span class="mobile-break" style="font-family: monospace;">${order.id}</span></p>
                    <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}</p>
                    <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #10b981;">Paid</span></p>
                  </div>

                  <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #667eea; margin-top: 0;">Order Items</h2>
                    <table class="mobile-table" style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background: #f3f4f6;">
                          <th style="padding: 10px; text-align: left;">Item</th>
                          <th style="padding: 10px; text-align: center;">Qty</th>
                          <th style="padding: 10px; text-align: right;">Price</th>
                          <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsList}
                      </tbody>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                      <tr>
                        <td style="padding: 4px 0; text-align: left;">Subtotal:</td>
                        <td style="padding: 4px 0; text-align: right;">${formatPrice(order.total - order.shippingCost)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; text-align: left;">Shipping:</td>
                        <td style="padding: 4px 0; text-align: right;">${formatPrice(order.shippingCost)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0 0; text-align: left; font-size: 18px; font-weight: bold; color: #667eea;">Total:</td>
                        <td style="padding: 8px 0 0; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">${formatPrice(order.total)}</td>
                      </tr>
                    </table>
                  </div>

                  ${
                    order.shippingAddress
                      ? `
                  <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #667eea; margin-top: 0;">Shipping Address</h2>
                    <p style="margin: 5px 0;">${order.shippingAddress.name}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
                    <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
                    <p style="margin: 5px 0;">Phone: ${order.shippingAddress.phone}</p>
                  </div>
                  `
                      : ''
                  }

                  <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 14px;">
                      <strong>What&apos;s Next?</strong><br>
                      We&apos;ll send you another email once your order ships with tracking information.
                    </p>
                  </div>

                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/track?id=${order.id}&guestEmail=${encodeURIComponent(order.guestEmail || order.user?.email || '')}"
                       class="mobile-button"
                       style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Track Your Order
                    </a>
                  </div>

                  <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
                    Questions? Contact us at contact@yourstore.com
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px; text-align: center; font-size: 12px; color: #999;">
                  <p style="margin: 0;">&copy; 2025 onlyinkani.in. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getOrderShippedEmail(order: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Order Shipped! 📦</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${order.user?.name || order.guestName || 'Customer'},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news! Your order has been shipped and is on its way to you.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">Shipping Details</h2>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> <span style="font-family: monospace;">${order.id}</span></p>
          ${
            order.trackingNumber
              ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 5px 10px; border-radius: 4px;">${order.trackingNumber}</span></p>`
              : ''
          }
          <p style="margin: 5px 0;"><strong>Shipped Date:</strong> ${new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</p>
        </div>
        
        <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>📍 Delivery Address:</strong><br>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          ${
            order.trackingNumber
              ? `
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/track?id=${order.id}&guestEmail=${encodeURIComponent(order.guestEmail || order.user?.email || '')}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            Track Package
          </a>
          `
              : ''
          }
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
             style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid #667eea;">
            Continue Shopping
          </a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
          Questions? Contact us at contact@yourstore.com
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2025 onlyinkani.in. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function getOrderDeliveredEmail(order: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Order Delivered! ✅</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${order.user?.name || order.guestName || 'Customer'},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Your order has been successfully delivered! We hope you love your purchase.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #10b981; margin-top: 0;">Order Details</h2>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> <span style="font-family: monospace;">${order.id}</span></p>
          <p style="margin: 5px 0;"><strong>Delivered:</strong> ${new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</p>
        </div>
        
        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>💚 Thank you for shopping with us!</strong><br>
            We'd love to hear your feedback about your purchase.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order.id}/review" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
            Leave a Review
          </a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
             style="display: inline-block; background: white; color: #10b981; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid #10b981;">
            Shop Again
          </a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
          Need help? Contact us at contact@onlyinkani.in
        </p>        
        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #999; text-decoration: none;">
            Unsubscribe from our newsletter
          </a>
        </p>      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2025 onlyinkani.in. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function getWelcomeEmail(user: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to onlyinkani.in</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to onlyinkani.in! 🎉</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${user.name || 'there'},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for creating an account with us! We're excited to have you as part of our community.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">What's Next?</h2>
          <ul style="padding-left: 20px;">
            <li style="margin-bottom: 10px;">Browse our latest products</li>
            <li style="margin-bottom: 10px;">Add items to your wishlist</li>
            <li style="margin-bottom: 10px;">Enjoy fast and secure checkout</li>
            <li style="margin-bottom: 10px;">Track your orders in real-time</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Start Shopping
          </a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
          Need help? Contact us at contact@onlyinkani.in
        </p>
        
        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #999; text-decoration: none;">
            Unsubscribe from our newsletter
          </a>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2026 Onlyinkani.in. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function getContactFormEmail(contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📧 New Contact Form Submission</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">Contact Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${contactData.email}" style="color: #667eea; text-decoration: none;">
                  ${contactData.email}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.subject}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">Message</h2>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word;">
${contactData.message}
          </div>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>⚠️ Action Required:</strong> Please respond to this customer inquiry within 24 hours.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>This is an automated notification from your website contact form.</p>
        <p>© 2026 Onlyinkani.in. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function getVerificationEmail(user: any, verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✉️ Verify Your Email</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${user.name || 'there'},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Welcome to <strong>Onlyinkani.in</strong>! We're excited to have you join our community.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          To get started and access your account, please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
          Or copy and paste this link in your browser:
        </p>
        
        <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; word-break: break-all; font-size: 12px; color: #667eea; margin-bottom: 20px;">
          ${verificationUrl}
        </div>
        
        <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #004085;">
            <strong>⏰ This link expires in 24 hours.</strong> After that, you'll need to register again if you haven't verified your email.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          Best regards,<br>
          <strong>The Onlyinkani.in Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2026 Onlyinkani.in. All rights reserved.</p>
        <p style="margin: 5px 0;">
          <a href="https://onlyinkani.in/privacy-policy" style="color: #999; text-decoration: none;">Privacy Policy</a> | 
          <a href="https://onlyinkani.in/terms-of-service" style="color: #999; text-decoration: none;">Terms of Service</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

export function getAdminNewUserEmail(user: any) {
  const name = user.name || 'New user';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New User Registration</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #111827; padding: 24px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0;">New User Registered</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">A new user just signed up.</p>
        <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #eee;">
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 0;"><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #999;">
        <p>© 2026 Onlyinkani.in. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function getAdminNewOrderEmail(order: any) {
  const customerName = order.user?.name || order.guestName || 'Customer';
  const customerEmail = order.user?.email || order.guestEmail || 'N/A';
  const itemCount = order.items?.length || 0;
  const total = order.total || order.totalAmount || order.totalPrice || 'N/A';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0f766e; padding: 24px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; margin: 0;">New Order Received</h1>
      </div>
      <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">A new order has been placed.</p>
        <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #eee;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${order.id}</p>
          <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin: 0 0 8px;"><strong>Items:</strong> ${itemCount}</p>
          <p style="margin: 0;"><strong>Total:</strong> ${total}</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #999;">
        <p>© 2026 Onlyinkani.in. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

