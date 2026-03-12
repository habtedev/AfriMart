// server/src/service/orderNotification.service.js
const { sendMail } = require('../utils/mailer');

async function notifyOrderSuccess(order, shippingAddress) {
  try {
    if (!order || !order.tx_ref) {
      throw new Error('Order object with tx_ref is required');
    }

    let userEmail = null;
      // Debug: log all possible email sources
      console.log('[OrderNotification] Debug email sources:', {
        userIdEmail: order.userId && typeof order.userId === 'object' ? order.userId.email : undefined,
        userEmail: order.user && order.user.email,
        orderEmail: order.email,
        paymentEmail: order.payment && order.payment.email,
        customerEmail: order.customer && order.customer.email,
        payloadEmail: order.payload && order.payload.email,
        shippingAddressEmail: shippingAddress?.email
      });
    // Prefer user email from populated user object
      if (order.userId && typeof order.userId === 'object' && order.userId.email) {
        userEmail = order.userId.email;
      } else if (order.user && order.user.email) {
        userEmail = order.user.email;
      } else if (order.email) {
        userEmail = order.email;
      } else if (order.payment && order.payment.email) {
        userEmail = order.payment.email;
      } else if (order.customer && order.customer.email) {
        userEmail = order.customer.email;
      } else if (order.payload && order.payload.email) {
        userEmail = order.payload.email;
      } else if (shippingAddress?.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(shippingAddress.email)) {
          userEmail = shippingAddress.email;
        }
      }
      console.log('[OrderNotification] Final selected userEmail:', userEmail);
      // If no customer email, skip sending and log warning
      if (!userEmail) {
        console.warn(`⚠️ No valid customer email found for order ${order.tx_ref}. Confirmation email not sent.`);
        return { success: false, orderId: order.tx_ref, error: 'No customer email found' };
      }

    const emailContent = prepareEmailContent({ ...order, orderId: order.tx_ref }, shippingAddress);

    await sendMail({
      to: userEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    console.log(`✅ Order confirmation email sent for order ${order.tx_ref} to ${userEmail}`);
    return { success: true, orderId: order.tx_ref, email: userEmail };

  } catch (error) {
    console.error(`❌ Failed to send order notification for order ${order?.tx_ref}:`, error);
    return { 
      success: false, 
      orderId: order?.tx_ref, 
      error: error.message 
    };
  }
}

function validateAndGetEmail(shippingAddress) {
  if (shippingAddress?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(shippingAddress.email)) {
      return shippingAddress.email;
    }
    console.warn(`⚠️ Invalid email format in shipping address: ${shippingAddress.email}`);
  }
  
  const adminEmail = process.env.BREVO_USER;
  if (!adminEmail) {
    throw new Error('No valid email address found and BREVO_USER is not configured');
  }
  
  console.log(`📧 Using admin email for order notification: ${adminEmail}`);
  return adminEmail;
}

function prepareEmailContent(order, shippingAddress) {
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const orderTotal = order.totalAmount 
    ? `${parseFloat(order.totalAmount).toLocaleString('en-ET')} ETB`
    : 'N/A';

  // Calculate subtotal for items
  let subtotal = 0;
  let itemsHtml = '';
  let itemsText = '';
  
  if (order.items && order.items.length > 0) {
    // Text version
    itemsText = '\n📦 ORDER ITEMS\n' + '─'.repeat(30) + '\n';
    order.items.forEach((item, idx) => {
      let productTitle = item.productTitle || item.title || item.product?.title || item.productId?.title || 'Product';
      if (!productTitle && item.productId && typeof item.productId === 'string') {
        productTitle = item.productId;
      }
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      subtotal += itemTotal;
      
      itemsText += `${idx + 1}. ${productTitle}\n`;
      itemsText += `   Quantity: ${item.quantity} × ${item.price} ETB    =    ${itemTotal.toLocaleString()} ETB\n\n`;
    });

    // HTML version
    itemsHtml = `
      <div class="order-items">
        <h2 class="section-title">📦 Order Items</h2>
        <div class="items-container">
          ${order.items.map((item, idx) => {
            let productTitle = item.productTitle || item.title || item.product?.title || item.productId?.title || 'Product';
            if (!productTitle && item.productId && typeof item.productId === 'string') {
              productTitle = item.productId;
            }
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            let image = item.product?.image || item.productId?.image || item.image || '';
            let category = item.product?.category || item.productId?.category || item.category || '';
            let productId = item.product?._id || item.productId?._id || item.productId || '';
            // Fallback for image
            if (image && !image.startsWith('http')) {
              image = `https://res.cloudinary.com/demo/image/upload/w_60,h_60,c_fill/${image}`;
            }
            // Build product link (assume /products/[id] route)
            let productLink = productId ? `https://afrimart.com/products/${productId}` : null;
            return `
              <div class="item-row">
                <div class="item-info" style="display: flex; align-items: center; gap: 14px;">
                  ${image ? `<img src="${image}" alt="${productTitle}" class="item-img" style="width:48px;height:48px;border-radius:8px;object-fit:cover;box-shadow:0 1px 4px rgba(0,0,0,0.08);" />` : ''}
                  <div>
                    <span class="item-number">${idx + 1}.</span>
                    ${productLink ? `<a href="${productLink}" style="color:#2b6cb0;text-decoration:underline;" target="_blank" rel="noopener"><span class="item-name">${productTitle}</span></a>` : `<span class="item-name">${productTitle}</span>`}<br/>
                    <span style="font-size:12px;color:#888;">${category ? `Category: ${category}` : ''}${category && productId ? ' | ' : ''}${productId ? `ID: ${productId}` : ''}</span>
                  </div>
                </div>
                <div class="item-details" style="display: flex; gap: 2em;">
                  <span class="item-quantity">${item.quantity} × ${item.price} ETB</span>
                  <span class="item-total">${itemTotal.toLocaleString()} ETB</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Build shipping info
  let shippingInfoHtml = '';
  let shippingInfoText = '';
  
  if (shippingAddress) {
    const name = shippingAddress.name || shippingAddress.fullName || 'Customer';
    const address = shippingAddress.address || shippingAddress.street || 'N/A';
    const city = shippingAddress.city || '';
    const state = shippingAddress.state || '';
    const zip = shippingAddress.zipCode || shippingAddress.zip || '';
    const country = shippingAddress.country || '';
    const phone = shippingAddress.phone || '';

    shippingInfoText = `
🚚 SHIPPING INFORMATION
${'─'.repeat(30)}
${name}
${address}
${city}${city && state ? ',' : ''} ${state} ${zip}
${country}
${phone ? '📞 ' + phone : ''}
    `;

    shippingInfoHtml = `
      <div class="shipping-info">
        <h2 class="section-title">🚚 Shipping Information</h2>
        <div class="address-card">
          <div class="address-icon">📍</div>
          <div class="address-details">
            <p class="customer-name">${name}</p>
            <p>${address}</p>
            <p>${city}${city && state ? ',' : ''} ${state} ${zip}</p>
            ${country ? `<p>${country}</p>` : ''}
            ${phone ? `<p class="phone">📞 ${phone}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Text version
  const text = `
🎉 ORDER CONFIRMATION
${'═'.repeat(30)}

📋 ORDER SUMMARY
${'─'.repeat(30)}
Order ID: ${order.tx_ref}
Date: ${orderDate}
Status: ✅ Confirmed
Total Amount: ${orderTotal}

${itemsText}

${shippingInfoText}

📦 NEXT STEPS
${'─'.repeat(30)}
Your order has been successfully placed and is being processed. 
You'll receive another email when your order ships.

💬 NEED HELP?
${'─'.repeat(30)}
Contact our support team:
📧 ${process.env.SUPPORT_EMAIL || 'support@example.com'}
📞 ${process.env.SUPPORT_PHONE || 'Available 24/7'}

Thank you for shopping with ${process.env.COMPANY_NAME || 'us'}!
${'═'.repeat(30)}
  `;

  // Defensive: ensure order.items is an array
  const itemsArr = Array.isArray(order.items) ? order.items : [];
  // Defensive: ensure order.items is an array
  // ...existing code...
  // Fallback for orderId
  const orderId = order.tx_ref || order.orderId || order._id || 'N/A';
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderId}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f6f9fc; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); overflow: hidden; }
    .header { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 32px 24px 24px 24px; text-align: center; position: relative; }
    .logo { width: 80px; height: 80px; margin-bottom: 12px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .confirmation-icon { font-size: 48px; margin-bottom: 8px; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }
    .header p { font-size: 16px; opacity: 0.95; margin-bottom: 0; }
    .order-summary { background: #f6f9fc; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1.5px solid #e3eaf2; }
    .order-id { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: #667eea; margin-bottom: 10px; }
    .order-meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
    .meta-item { display: flex; flex-direction: column; gap: 3px; }
    .meta-label { font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-value { font-size: 15px; font-weight: 600; color: #333; }
    .total-amount { background: linear-gradient(90deg, #48bb78 0%, #38a169 100%); color: #fff; padding: 12px; border-radius: 8px; text-align: center; font-size: 22px; font-weight: 700; margin-top: 16px; box-shadow: 0 2px 8px rgba(72,187,120,0.12); }
    .section-title { font-size: 18px; font-weight: 600; color: #333; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 1.5px solid #e9ecef; display: flex; align-items: center; gap: 8px; }
    .items-container { background: #fff; border-radius: 8px; border: 1px solid #e9ecef; }
    .item-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
    .item-row:last-child { border-bottom: none; }
    .item-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-right: 8px; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 500; font-size: 15px; color: #333; }
    .item-details { font-size: 13px; color: #6c757d; }
    .item-total { font-weight: 600; color: #38a169; font-size: 14px; }
    .shipping-info { margin: 24px 0; }
    .address-card { display: flex; gap: 16px; background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #e9ecef; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }
    .address-icon { font-size: 22px; color: #667eea; }
    .address-details { flex: 1; }
    .customer-name { font-weight: 600; font-size: 16px; margin-bottom: 6px; color: #333; }
    .address-details p { margin-bottom: 4px; color: #6c757d; }
    .phone { color: #667eea; font-weight: 500; }
    .next-steps { background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b; }
    .next-steps h3 { color: #92400e; margin-bottom: 8px; }
    .track-btn { display: inline-block; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 12px 28px; border-radius: 24px; font-size: 16px; font-weight: 600; text-decoration: none; margin: 18px 0; box-shadow: 0 2px 8px rgba(102,126,234,0.12); transition: background 0.2s; }
    .track-btn:hover { background: linear-gradient(90deg, #764ba2 0%, #667eea 100%); }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e9ecef; }
    .support-info { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
    .support-item { display: flex; align-items: center; gap: 8px; color: #6c757d; }
    .company-name { color: #667eea; font-weight: 600; font-size: 18px; margin: 8px 0; }
    .copyright { color: #6c757d; font-size: 13px; margin-top: 12px; }
    @media (max-width: 600px) { .order-meta { grid-template-columns: 1fr; } .address-card { flex-direction: column; gap: 8px; } .support-info { flex-direction: column; gap: 10px; } .header h1 { font-size: 20px; } }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://res.cloudinary.com/demo/image/upload/v1690000000/afrimart-logo.png" alt="AfriMart Logo" class="logo" />
      <div class="confirmation-icon">🎉</div>
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase! We're preparing your order.</p>
    </div>
    <div class="content">
      <div class="order-summary">
        <div class="order-id">
          <span>📋</span>
          <span>Order #${orderId}</span>
        </div>
        <div class="order-meta">
          <div class="meta-item">
            <span class="meta-label">Order Date</span>
            <span class="meta-value">${orderDate}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Order Status</span>
            <span class="meta-value" style="color: #48bb78;">✅ Confirmed</span>
          </div>
        </div>
        <div class="total-amount">
          ${orderTotal}
        </div>
      </div>
      <div class="section-title">📦 Order Items</div>
      <div class="items-container">
        ${itemsArr.length > 0
          ? itemsArr.map((item, idx) => {
              let imageUrl = '';
              if (item.productId && typeof item.productId === 'object' && item.productId.image) {
                imageUrl = item.productId.image.startsWith('http')
                  ? item.productId.image
                  : `https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill/${item.productId.image}`;
              } else if (item.image) {
                imageUrl = item.image.startsWith('http')
                  ? item.image
                  : `https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill/${item.image}`;
              }
              const name = item.productId && typeof item.productId === 'object' && item.productId.title
                ? item.productId.title
                : item.productTitle || item.title || item.product?.title || item.productId?.title || item.productId || 'Product';
              const price = item.price || (item.productId && typeof item.productId === 'object' && item.productId.price) || 0;
              return `<div class="item-row">
                ${imageUrl ? `<img src='${imageUrl}' alt='Product Image' class='item-img' />` : ''}
                <div class="item-info">
                  <span class="item-name">${name}</span>
                  <span class="item-details">${item.quantity} × ${price} ETB</span>
                </div>
                <span class="item-total">${(price * (item.quantity || 1)).toLocaleString()} ETB</span>
              </div>`;
            }).join('')
          : `<div style='padding:16px; color:#888; text-align:center;'>No order items found.</div>`}
      </div>
      <div class="shipping-info">
        <div class="section-title">🚚 Shipping Information</div>
        <div class="address-card">
          <div class="address-icon">📍</div>
          <div class="address-details">
            <p class="customer-name">${shippingAddress.name || shippingAddress.fullName || 'Customer'}</p>
            <p>${shippingAddress.address || shippingAddress.street || 'N/A'}</p>
            <p>${shippingAddress.city || ''}${shippingAddress.city && shippingAddress.state ? ',' : ''} ${shippingAddress.state || ''} ${shippingAddress.zipCode || shippingAddress.zip || ''}</p>
            ${shippingAddress.country ? `<p>${shippingAddress.country}</p>` : ''}
            ${shippingAddress.phone ? `<p class="phone">📞 ${shippingAddress.phone}</p>` : ''}
          </div>
        </div>
      </div>
      <div class="next-steps">
        <h3>📦 What's Next?</h3>
        <p>Your order has been successfully placed and is being processed. You'll receive another email when your order ships with tracking information.</p>
        <a href="https://afrimart.com/track/${order.tx_ref}" class="track-btn">Track Your Order</a>
      </div>
    </div>
    <div class="footer">
      <div class="section-title">💬 Need Help?</div>
      <div class="support-info">
        <div class="support-item">
          <span>📧</span>
          <span>${process.env.SUPPORT_EMAIL || 'support@example.com'}</span>
        </div>
        <div class="support-item">
          <span>📞</span>
          <span>${process.env.SUPPORT_PHONE || 'Available 24/7'}</span>
        </div>
      </div>
      <p class="company-name">${process.env.COMPANY_NAME || 'AfriMart'}</p>
      <p class="copyright">© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'AfriMart'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return {
    subject: `🎉 Order Confirmed! #${order.tx_ref}`,
    text: text.trim(),
    html: html
  };
}

function prepareOrderStatusEmailContent(order, status, timeline = []) {
    // Build order items HTML (reuse logic from confirmation)
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = `
        <div class="order-items">
          <h2 class="section-title">📦 Order Items</h2>
          <div class="items-container">
            ${order.items.map((item, idx) => {
              let productTitle = item.productTitle || item.title || item.product?.title || item.productId?.title || 'Product';
              if (!productTitle && item.productId && typeof item.productId === 'string') {
                productTitle = item.productId;
              }
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              let image = item.product?.image || item.productId?.image || item.image || '';
              let category = item.product?.category || item.productId?.category || item.category || '';
              let productId = item.product?._id || item.productId?._id || item.productId || '';
              if (image && !image.startsWith('http')) {
                image = `https://res.cloudinary.com/demo/image/upload/w_60,h_60,c_fill/${image}`;
              }
              return `
                <div class="item-row">
                  <div class="item-info" style="display: flex; align-items: center; gap: 14px;">
                    ${image ? `<img src="${image}" alt="${productTitle}" class="item-img" style="width:48px;height:48px;border-radius:8px;object-fit:cover;box-shadow:0 1px 4px rgba(0,0,0,0.08);" />` : ''}
                    <div>
                      <span class="item-number">${idx + 1}.</span>
                      <span class="item-name">${productTitle}</span><br/>
                      <span style="font-size:12px;color:#888;">${category ? `Category: ${category}` : ''}${category && productId ? ' | ' : ''}${productId ? `ID: ${productId}` : ''}</span>
                    </div>
                  </div>
                  <div class="item-details" style="display: flex; gap: 2em;">
                    <span class="item-quantity">${item.quantity} × ${item.price} ETB</span>
                    <span class="item-total">${itemTotal.toLocaleString()} ETB</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const orderTotal = order.totalAmount 
    ? `${parseFloat(order.totalAmount).toLocaleString('en-ET')} ETB`
    : 'N/A';

  // Status configuration
  const statusConfig = {
    processing: {
      icon: '🔄',
      title: 'Processing Your Order',
      message: 'Your order is being prepared and will be shipped soon.',
      color: '#f59e0b',
      bgColor: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
    },
    shipped: {
      icon: '🚚',
      title: 'Order Shipped!',
      message: 'Your order is on the way! Track your package for real-time updates.',
      color: '#3b82f6',
      bgColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
    },
    delivered: {
      icon: '📦',
      title: 'Order Delivered!',
      message: 'Your order has been successfully delivered. Thank you for shopping with us!',
      color: '#10b981',
      bgColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
    },
    cancelled: {
      icon: '❌',
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. Contact support if you need assistance.',
      color: '#ef4444',
      bgColor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
    },
    refunded: {
      icon: '💸',
      title: 'Order Refunded',
      message: 'Your order has been refunded. The amount will reflect in your account shortly.',
      color: '#8b5cf6',
      bgColor: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
    },
    on_hold: {
      icon: '⏸️',
      title: 'Order On Hold',
      message: 'Your order is temporarily on hold. We\'ll update you as soon as possible.',
      color: '#6b7280',
      bgColor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
    }
  };

  const config = statusConfig[status] || {
    icon: '📊',
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your order status has been updated to ${status}.`,
    color: '#667eea',
    bgColor: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
  };

  // Text version
  const text = `
${config.icon} ORDER STATUS UPDATE
${'═'.repeat(30)}

📋 ORDER DETAILS
${'─'.repeat(30)}
Order ID: ${order.tx_ref}
Date: ${orderDate}
Total: ${orderTotal}
Status: ${status}

${config.message}

${timeline.length > 0 ? `\n📅 ORDER TIMELINE\n${'─'.repeat(30)}\n${timeline.map(t => `${t.date}: ${t.status}`).join('\n')}\n` : ''}

💬 NEED HELP?
${'─'.repeat(30)}
Contact our support team:
📧 ${process.env.SUPPORT_EMAIL || 'support@example.com'}
📞 ${process.env.SUPPORT_PHONE || 'Available 24/7'}

Thank you for shopping with ${process.env.COMPANY_NAME || 'us'}!
${'═'.repeat(30)}
  `;

  // HTML version with timeline
  let timelineHtml = '';
  if (timeline.length > 0) {
    timelineHtml = `
      <div class="timeline">
        <h3 class="section-title">📅 Order Timeline</h3>
        <div class="timeline-container">
          ${timeline.map((event, index) => `
            <div class="timeline-item ${index === timeline.length - 1 ? 'current' : ''}">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-date">${event.date}</div>
                <div class="timeline-status">${event.status}</div>
                ${event.note ? `<div class="timeline-note">${event.note}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

 const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Order Update</title>

<style>

body{
margin:0;
background:#f3f6fb;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
}

.container{
max-width:650px;
margin:40px auto;
background:#ffffff;
border-radius:20px;
overflow:hidden;
box-shadow:0 20px 45px rgba(0,0,0,0.08);
border:1px solid #e6edf5;
}

.hero{
background:linear-gradient(135deg,${config.color},${config.bgColor});
color:white;
padding:50px 30px;
text-align:center;
}

.hero-icon{
font-size:56px;
margin-bottom:12px;
}

.hero h1{
margin:0;
font-size:30px;
font-weight:700;
}

.hero p{
margin-top:10px;
font-size:16px;
opacity:.9;
}

.content{
padding:32px;
}

.card{
background:#f8fafc;
border-radius:14px;
padding:22px;
border:1px solid #e8edf4;
margin-bottom:24px;
}

.order-id{
font-size:20px;
font-weight:700;
color:#111827;
margin-bottom:12px;
}

.meta{
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.meta-label{
font-size:12px;
color:#6b7280;
text-transform:uppercase;
}

.meta-value{
font-size:15px;
font-weight:600;
color:#111827;
}

.status-badge{
display:inline-block;
padding:8px 14px;
border-radius:30px;
font-weight:600;
font-size:13px;
background:${config.color}20;
color:${config.color};
}

.total{
margin-top:18px;
background:linear-gradient(135deg,#22c55e,#16a34a);
color:white;
padding:16px;
text-align:center;
border-radius:10px;
font-weight:700;
font-size:22px;
}

.section-title{
font-weight:700;
font-size:18px;
margin:26px 0 12px 0;
color:#111827;
}

.item{
display:flex;
align-items:center;
padding:14px 0;
border-bottom:1px solid #edf1f6;
}

.item:last-child{
border-bottom:none;
}

.item img{
width:48px;
height:48px;
border-radius:10px;
margin-right:14px;
object-fit:cover;
}

.item-name{
font-weight:600;
color:#111827;
}

.item-meta{
font-size:13px;
color:#6b7280;
}

.item-price{
margin-left:auto;
font-weight:600;
color:${config.color};
}

.timeline{
margin-top:10px;
border-left:3px solid #e5e7eb;
padding-left:18px;
}

.step{
margin-bottom:18px;
}

.step strong{
color:${config.color};
display:block;
}

.note{
font-size:14px;
color:#6b7280;
}

.info-box{
background:#fff7ed;
border-left:4px solid #f59e0b;
padding:16px;
border-radius:8px;
margin-top:20px;
}

.footer{
background:#f9fafc;
text-align:center;
padding:28px;
border-top:1px solid #edf1f6;
}

.support{
color:#6b7280;
font-size:14px;
}

.company{
font-weight:700;
margin-top:8px;
}

.copy{
font-size:13px;
color:#9ca3af;
margin-top:6px;
}

@media(max-width:640px){

.container{
margin:12px;
}

.meta{
grid-template-columns:1fr;
}

}

</style>
</head>

<body>

<div class="container">

<div class="hero">
<div class="hero-icon">${config.icon}</div>
<h1>${config.title}</h1>
<p>${config.message}</p>
</div>

<div class="content">

<div class="card">

<div class="order-id">Order #${order.tx_ref}</div>

<div class="meta">

<div>
<div class="meta-label">Order Date</div>
<div class="meta-value">${orderDate}</div>
</div>

<div>
<div class="meta-label">Status</div>
<div class="meta-value">
<span class="status-badge">${status}</span>
</div>
</div>

</div>

<div class="total">
${orderTotal}
</div>

</div>

${itemsHtml}

<div class="section-title">Order Timeline</div>

<div class="timeline">
${timelineHtml}
</div>

<div class="info-box">
${config.message}. If you have any questions please contact support.
</div>

</div>

<div class="footer">

<div class="support">
📧 ${process.env.SUPPORT_EMAIL || 'support@example.com'}  
<br>
📞 ${process.env.SUPPORT_PHONE || '24/7 Support'}
</div>

<div class="company">
${process.env.COMPANY_NAME}
</div>

<div class="copy">
© ${new Date().getFullYear()} ${process.env.COMPANY_NAME}
</div>

</div>

</div>

</body>
</html>
`;
  
  return {
    subject: `${config.icon} Order ${status.charAt(0).toUpperCase() + status.slice(1)}! #${order.tx_ref}`,
    text: text.trim(),
    html: html
  };
}

async function notifyOrderStatusChange(order, status, timeline = []) {
  try {
    // Diagnostic: log the order object and all possible email sources
    console.log('[OrderNotification][StatusChange] Order object:', JSON.stringify(order, null, 2));
    let userEmail = null;
    const emailSources = {
      userIdEmail: order.userId && typeof order.userId === 'object' ? order.userId.email : undefined,
      userEmail: order.user && order.user.email,
      orderEmail: order.email,
      paymentEmail: order.payment && order.payment.email,
      customerEmail: order.customer && order.customer.email,
      payloadEmail: order.payload && order.payload.email,
      shippingAddressEmail: order.shippingAddress && order.shippingAddress.email
    };
    console.log('[OrderNotification][StatusChange] Email sources:', emailSources);
    if (emailSources.userIdEmail) {
      userEmail = emailSources.userIdEmail;
    } else if (emailSources.userEmail) {
      userEmail = emailSources.userEmail;
    } else if (emailSources.orderEmail) {
      userEmail = emailSources.orderEmail;
    } else if (emailSources.paymentEmail) {
      userEmail = emailSources.paymentEmail;
    } else if (emailSources.customerEmail) {
      userEmail = emailSources.customerEmail;
    } else if (emailSources.payloadEmail) {
      userEmail = emailSources.payloadEmail;
    } else if (emailSources.shippingAddressEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(emailSources.shippingAddressEmail)) {
        userEmail = emailSources.shippingAddressEmail;
      }
    }
    console.log('[OrderNotification][StatusChange] Selected userEmail:', userEmail);
    if (!userEmail) {
      console.warn(`⚠️ No valid customer email found for order ${order.tx_ref}. Status update email not sent.`);
      return { success: false, orderId: order.tx_ref, error: 'No customer email found' };
    }

    const emailContent = prepareOrderStatusEmailContent(order, status, timeline);
    try {
      await sendMail({
        to: userEmail,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      });
      console.log(`✅ Order status update email sent for order ${order.tx_ref} to ${userEmail}`);
      return { success: true, orderId: order.tx_ref, email: userEmail };
    } catch (mailerError) {
      console.error(`[OrderNotification][StatusChange] ❌ Mailer error for order ${order.tx_ref}:`, mailerError);
      return { success: false, orderId: order.tx_ref, error: mailerError.message };
    }
  } catch (error) {
    console.error(`[OrderNotification][StatusChange] ❌ Failed to send order status notification for order ${order?.tx_ref}:`, error);
    return { success: false, orderId: order?.tx_ref, error: error.message };
  }
}

// Retry function with improved logging
async function notifyOrderSuccessWithRetry(order, shippingAddress, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await notifyOrderSuccess(order, shippingAddress);
      if (result.success) {
        return result;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`🔄 Retrying notification for order ${order.tx_ref} (attempt ${attempt}/${maxRetries}) in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for order ${order.tx_ref}:`, error);
    }
  }
  
  console.error(`❌ All ${maxRetries} retry attempts failed for order ${order.tx_ref}`);
  return { success: false, orderId: order.tx_ref, error: 'Max retries exceeded' };
}

module.exports = { 
  notifyOrderSuccess,
  notifyOrderSuccessWithRetry,
  prepareEmailContent,
  notifyOrderStatusChange 
};