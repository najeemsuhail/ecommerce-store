export function getOrderConfirmationEmail(order: any) {
  const itemsList = order.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.product.name}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${item.price.toFixed(2)}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${(item.quantity * item.price).toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Hi ${order.user?.name || order.guestName || 'Customer'},
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for your order! We've received your payment and are processing your order.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> <span style="font-family: monospace;">${order.id}</span></p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</p>
          <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #10b981;">Paid</span></p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #667eea; margin-top: 0;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
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
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Subtotal:</span>
              <span>₹${(order.total - order.shippingCost).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Shipping:</span>
              <span>₹${order.shippingCost.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #667eea;">
              <span>Total:</span>
              <span>₹${order.total.toFixed(2)}</span>
            </div>
          </div>
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
            <strong>📦 What's Next?</strong><br>
            We'll send you another email once your order ships with tracking information.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/track?id=${order.id}&email=${order.guestEmail || order.user?.email}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Track Your Order
          </a>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
          Questions? Contact us at support@yourstore.com
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2025 E-Store. All rights reserved.</p>
      </div>
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
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/track?id=${order.id}&email=${order.guestEmail || order.user?.email}" 
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
          Questions? Contact us at support@yourstore.com
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2025 E-Store. All rights reserved.</p>
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
          Need help? Contact us at support@yourstore.com
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2025 E-Store. All rights reserved.</p>
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
      <title>Welcome to E-Store</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to E-Store! 🎉</h1>
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
          Need help? Contact us at support@yourstore.com
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>© 2025 E-Store. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}