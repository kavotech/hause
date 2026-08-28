// Vercel serverless function: POST /api/contact
// Sends a copy of the enquiry to Hausworks and a confirmation to the customer, via Resend.
//
// Required environment variable (set in the Vercel project dashboard, never in source control):
//   RESEND_API_KEY
//
// Before this works, the sending domain (hausworks.uk) must be verified in the
// Resend dashboard (Domains -> Add Domain -> add the DNS records it gives you).
// Until that's done, Resend will reject sends from an @hausworks.uk "from" address.

const ADMIN_EMAIL = 'info@hausworks.uk';
const FROM_EMAIL = 'Hausworks Website <bookings@hausworks.uk>';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email service is not configured yet. Please call or WhatsApp us instead.' });
    return;
  }

  const body = req.body || {};
  const service = clean(body.service_required) || 'Not specified';
  const fullName = clean(body.full_name);
  const phone = clean(body.phone);
  const email = clean(body.email);
  const postcode = clean(body.postcode);
  const timeline = clean(body.project_timeline);
  const preferredContact = clean(body.preferred_contact);
  const details = clean(body.project_details);

  if (!fullName || !phone || !email) {
    res.status(400).json({ error: 'Please fill in your name, phone and email.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const firstName = fullName.split(' ')[0];

  const adminHtml = `
    <div style="font-family:Arial,sans-serif;background:#0b0b0b;color:#ffffff;padding:24px;">
      <h2 style="color:#c9963e;margin:0 0 16px;">New quote request: ${esc(service)}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${row('Name', fullName)}
        ${row('Phone', phone)}
        ${row('Email', email)}
        ${row('Postcode', postcode)}
        ${row('Timeline', timeline)}
        ${row('Preferred contact', preferredContact)}
      </table>
      <p style="margin:20px 0 6px;color:#999999;">Job details:</p>
      <p style="white-space:pre-wrap;margin:0;">${esc(details) || '(none given)'}</p>
    </div>
  `;

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;background:#0b0b0b;color:#ffffff;padding:32px;text-align:center;">
      <img src="https://hausworks.uk/front/images/favicon.png" width="56" height="56" style="border-radius:12px;margin-bottom:16px;" alt="Hausworks">
      <h2 style="color:#ffffff;margin:0 0 12px;">Thanks${firstName ? ', ' + esc(firstName) : ''}!</h2>
      <p style="color:#cccccc;max-width:420px;margin:0 auto 20px;">
        We've received your ${esc(service)} enquiry and will be in touch within 24 hours with a free, no-obligation quote.
      </p>
      <div style="background:#151515;border:1px solid #ffffff26;padding:20px;text-align:left;max-width:420px;margin:0 auto;">
        <p style="margin:0 0 8px;color:#999999;font-size:13px;">Your request</p>
        <p style="margin:0;color:#ffffff;">${esc(service)}${details ? ' — ' + esc(details) : ''}</p>
      </div>
      <p style="color:#999999;margin-top:24px;font-size:14px;">
        Need to talk sooner? Call <a href="tel:+447713956824" style="color:#c9963e;">+44 7713 956824</a>
        or WhatsApp us any time — we're available 24/7.
      </p>
      <p style="color:#666666;font-size:12px;margin-top:30px;">Hausworks &middot; London &middot; info@hausworks.uk</p>
    </div>
  `;

  try {
    await Promise.all([
      sendEmail(apiKey, {
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        reply_to: email,
        subject: `New quote request: ${service}`,
        html: adminHtml,
      }),
      sendEmail(apiKey, {
        from: FROM_EMAIL,
        to: [email],
        subject: "We've received your enquiry — Hausworks",
        html: customerHtml,
      }),
    ]);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend send failed:', err);
    res.status(502).json({ error: 'Could not send that just now. Please call or WhatsApp us instead.' });
  }
};

async function sendEmail(apiKey, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }
  return response.json();
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function row(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:6px 10px 6px 0;color:#999999;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;color:#ffffff;">${esc(value)}</td></tr>`;
}
