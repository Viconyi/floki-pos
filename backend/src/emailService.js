// Email service for Floki's platform
const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST || 'mail.lynmercan.com';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER || 'floki@lynmercan.com';
const smtpPass = process.env.SMTP_PASS || 'Aggrey2027!';
const smtpFrom = process.env.SMTP_FROM || 'floki@lynmercan.com';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

function sendEmail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
    text,
  });
}

function currency(amount) {
  const num = Number(amount || 0);
  return `Kshs ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function buildETRReceiptHTML(order) {
  const company = {
    name: process.env.COMPANY_NAME || "Floki Hotel",
    address: process.env.COMPANY_ADDRESS || "Kisii, Kenya",
    kraPin: process.env.COMPANY_KRA_PIN || "KRA-PIN-XXXX",
    email: process.env.COMPANY_EMAIL || smtpFrom,
    phone: process.env.COMPANY_PHONE || "+2547XXXXXXX",
  };
  const created = new Date(order.createdAt || Date.now());
  const items = Array.isArray(order.items) ? order.items : [];
  const lines = items.map(it => {
    const qty = Number(it.quantity || 1);
    const mi = it.menuItem || {};
    const base = Number(mi.price || 0);
    const offerActive = !!mi.offerActive;
    const offerPercent = Number(mi.offerPercent || 0);
    const unit = offerActive && offerPercent > 0 ? Math.round(base * (1 - offerPercent / 100)) : base;
    const total = unit * qty;
    return { name: mi.name || it.name || 'Item', qty, unit, total };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const taxRate = Number(process.env.TAX_RATE || 0); // e.g., 0 or 16 (% VAT) if applicable
  const tax = Math.round(subtotal * (taxRate / 100));
  const grand = Number(order.total || (subtotal + tax));
  const servedBy = order.servedByName || '';
  const deliveryType = order.deliveryType || 'Pickup';
  const status = order.status || 'Completed';
  const ref = String(order._id || '').slice(-8);
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
    <div style="background:#1a2236;color:#fff;padding:18px 20px;">
      <div style="font-weight:800;font-size:20px;">${company.name}</div>
      <div style="opacity:0.85;font-size:14px;">ETR Receipt • ${created.toLocaleString()}</div>
    </div>
    <div style="padding:18px 20px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px;color:#2a2f43;">
        <div style="flex:1;min-width:240px;">
          <div style="font-weight:700">Customer</div>
          <div>${order.clientName || order.clientEmail || 'Client'}</div>
          ${order.clientEmail ? `<div style="color:#6a708a">${order.clientEmail}</div>` : ''}
          ${order.clientPhone ? `<div style="color:#6a708a">${order.clientPhone}</div>` : ''}
        </div>
        <div style="flex:1;min-width:240px;">
          <div style="font-weight:700">Business</div>
          <div>${company.name}</div>
          <div style="color:#6a708a">${company.address}</div>
          <div style="color:#6a708a">KRA PIN: ${company.kraPin}</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin:8px 0;color:#2a2f43;">
        <div>Order Ref: <strong>#${ref}</strong></div>
        <div>Type: <strong>${deliveryType}</strong></div>
        ${servedBy ? `<div>Served by: <strong>${servedBy}</strong></div>` : ''}
        <div>Status: <strong>${status}</strong></div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead>
          <tr style="background:#fafbfe;color:#6a708a;text-align:left">
            <th style="padding:8px;border-bottom:1px solid #eef0f6">Item</th>
            <th style="padding:8px;border-bottom:1px solid #eef0f6">Qty</th>
            <th style="padding:8px;border-bottom:1px solid #eef0f6">Unit</th>
            <th style="padding:8px;border-bottom:1px solid #eef0f6">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map(l => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #f0f2f7">${l.name}</td>
              <td style="padding:8px;border-bottom:1px solid #f0f2f7">${l.qty}</td>
              <td style="padding:8px;border-bottom:1px solid #f0f2f7">${currency(l.unit)}</td>
              <td style="padding:8px;border-bottom:1px solid #f0f2f7;text-align:right">${currency(l.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top:12px;border-top:1px solid #eef0f6;padding-top:12px">
        <div style="display:flex;justify-content:flex-end;gap:24px;color:#2a2f43">
          <div>Subtotal</div>
          <div style="font-weight:700">${currency(subtotal)}</div>
        </div>
        ${taxRate>0?`
        <div style="display:flex;justify-content:flex-end;gap:24px;color:#2a2f43">
          <div>Tax (${taxRate}%)</div>
          <div style="font-weight:700">${currency(tax)}</div>
        </div>`:''}
        <div style="display:flex;justify-content:flex-end;gap:24px;color:#1a2236;font-size:18px">
          <div>Total</div>
          <div style="font-weight:800">${currency(grand)}</div>
        </div>
      </div>
      <div style="margin-top:16px;color:#6a708a;font-size:12px">This is a system-generated ETR receipt.</div>
      <div style="margin-top:4px;color:#6a708a;font-size:12px">Contact: ${company.email} • ${company.phone}</div>
    </div>
  </div>`;
}

// Email templates
const templates = {
  signIn: (email) => ({
    subject: 'Sign In Notification',
    html: `<p>Hello ${email},<br/>You have signed in to Floki's platform.</p>`,
  }),
  signUp: (email) => ({
    subject: "Welcome to Floki's!",
    html: `<p>Hello ${email},<br/>Thank you for signing up!</p>`,
  }),
  orderPlaced: (order) => ({
    subject: 'Order Placed',
    html: `<p>Your order has been placed.<br/>Order details: ${JSON.stringify(order)}</p>`,
  }),
  preparing: (order) => ({
    subject: 'Order Preparing',
    html: `<p>Your order is being prepared.<br/>Order details: ${JSON.stringify(order)}</p>`,
  }),
  delivering: (order) => ({
    subject: 'Order Delivering',
    html: `<p>Your order is out for delivery.<br/>Order details: ${JSON.stringify(order)}</p>`,
  }),
  arrived: (order) => ({
    subject: 'Order Arrived',
    html: `<p>Your order has arrived.<br/>Order details: ${JSON.stringify(order)}</p>`,
  }),
  completed: (order) => ({
    subject: 'Order Completed',
    html: `<p>Your order is completed.<br/>Order details: ${JSON.stringify(order)}</p>`,
  }),
  etrReceipt: (order) => ({
    subject: `Your Receipt • Floki Order #${String(order._id||'').slice(-8)}`,
    html: buildETRReceiptHTML(order),
  }),
  passwordReset: (email, link) => ({
    subject: 'PIN Reset',
    html: `<p>Hello ${email},<br/>Reset your PIN <a href="${link}">here</a>.</p>`,
  }),
  offer: (offer) => ({
    subject: `Special Offer: ${offer.title}`,
    html: `<p>${offer.desc}<br/>Valid: ${offer.valid}</p>`,
  }),
  confirmationCode: (email, code) => ({
    subject: "Confirm Your Floki's Account",
    html: `<p>Hello ${email},<br/>Your confirmation code is <strong>${code}</strong>.<br/>Enter this code to verify your account. The code expires in 15 minutes.</p>`,
  }),
};

module.exports = {
  sendEmail,
  templates,
  buildETRReceiptHTML,
};
