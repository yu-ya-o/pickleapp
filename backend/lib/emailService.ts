import * as nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // For production, use actual SMTP settings
  // For Apple Private Relay, ensure your domain is registered in Apple Developer Portal
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using nodemailer
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  // Skip if email is not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('Email not configured, skipping send to:', params.to);
    return false;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'PickleHub'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('Failed to send email to:', params.to, error);
    return false;
  }
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(
  emails: SendEmailParams[],
  delayMs: number = 100
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const success = await sendEmail(email);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    // Add delay to avoid rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed };
}

interface EventReminderEmailParams {
  recipientEmail: string;
  recipientName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress?: string;
  eventUrl: string;
}

/**
 * Generate event reminder email HTML
 */
export function generateEventReminderEmail(params: EventReminderEmailParams): SendEmailParams {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>イベントリマインダー</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      padding: 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 12px 12px;
    }
    .event-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .event-title {
      font-size: 20px;
      font-weight: bold;
      color: #16a34a;
      margin-bottom: 15px;
    }
    .event-detail {
      display: flex;
      align-items: center;
      margin: 10px 0;
      color: #555;
    }
    .event-detail-icon {
      width: 24px;
      margin-right: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #888;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button-container {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>明日のイベントリマインダー</h1>
  </div>
  <div class="content">
    <p>${params.recipientName}さん、こんにちは！</p>
    <p>参加予定のイベントが<strong>明日</strong>開催されます。</p>

    <div class="event-card">
      <div class="event-title">${params.eventTitle}</div>
      <div class="event-detail">
        <span class="event-detail-icon">📅</span>
        <span>${params.eventDate}</span>
      </div>
      <div class="event-detail">
        <span class="event-detail-icon">🕐</span>
        <span>${params.eventTime}</span>
      </div>
      <div class="event-detail">
        <span class="event-detail-icon">📍</span>
        <span>${params.eventLocation}${params.eventAddress ? ` (${params.eventAddress})` : ''}</span>
      </div>
    </div>

    <div class="button-container">
      <a href="${params.eventUrl}" class="button">イベント詳細を見る</a>
    </div>

    <p>⚠️ 参加が難しくなった場合は、主催者にご迷惑をおかけしないよう、お早めにご連絡をお願いします。</p>
    <p>💡 マナーを守って、みんなで楽しいピックルボールを！</p>
    <p>忘れ物がないように準備して、当日お会いできることを楽しみにしています。</p>
  </div>
  <div class="footer">
    <p>このメールは PickleHub から自動送信されています。</p>
    <p>© ${new Date().getFullYear()} PickleHub</p>
  </div>
</body>
</html>
`;

  return {
    to: params.recipientEmail,
    subject: `【明日開催】${params.eventTitle} - リマインダー`,
    html,
  };
}
