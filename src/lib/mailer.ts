import { Resend } from "resend";

export type SendReviewEmailParams = {
  to: string;
  restaurantName: string;
  leadId: string;
};

export type SendReviewEmailResult = {
  success: boolean;
  error?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReviewEmailHtml({
  restaurantName,
  positiveUrl,
  negativeUrl,
}: {
  restaurantName: string;
  positiveUrl: string;
  negativeUrl: string;
}): string {
  const safeRestaurantName = escapeHtml(restaurantName);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>How was your experience?</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:32px 28px 20px;text-align:center;background:linear-gradient(180deg,#020617 0%,#0f172a 100%);">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#f59e0b;font-weight:600;">ReviewBite</p>
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.08em;color:#94a3b8;">Turn every table into a 5-star review</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:600;color:#ffffff;">How was your experience yesterday?</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#0f172a;">Hi there,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
                Thank you for visiting <strong style="color:#0f172a;">${safeRestaurantName}</strong> yesterday.
                Your feedback helps us improve and serve you better on your next visit.
              </p>
              <p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#0f172a;text-align:center;">
                How would you rate your experience?
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${positiveUrl}" style="display:inline-block;width:100%;max-width:320px;padding:16px 24px;background-color:#10b981;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:12px;text-align:center;box-sizing:border-box;">
                      Loved it! 👍
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${negativeUrl}" style="display:inline-block;width:100%;max-width:320px;padding:16px 24px;background-color:#ffffff;color:#0f172a;text-decoration:none;font-size:16px;font-weight:600;border-radius:12px;text-align:center;border:2px solid #e2e8f0;box-sizing:border-box;">
                      Could be better 👎
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">
                Sent via <strong style="color:#64748b;">ReviewBite</strong> because you connected at ${safeRestaurantName}.
                If you did not visit us, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendReviewEmail({
  to,
  restaurantName,
  leadId,
}: SendReviewEmailParams): Promise<SendReviewEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey) {
    console.error("[MAILER] RESEND_API_KEY is not configured.");
    return { success: false, error: "Resend API key missing" };
  }

  if (!from) {
    console.error("[MAILER] EMAIL_FROM is not configured.");
    return { success: false, error: "Sender address missing" };
  }

  if (!baseUrl) {
    console.error("[MAILER] NEXT_PUBLIC_APP_URL is not configured.");
    return { success: false, error: "App URL missing" };
  }

  const positiveUrl = `${baseUrl}/review/${leadId}?satisfied=true`;
  const negativeUrl = `${baseUrl}/review/${leadId}?satisfied=false`;
  const html = buildReviewEmailHtml({ restaurantName, positiveUrl, negativeUrl });

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `How was your experience at ${restaurantName} yesterday?`,
      html,
    });

    if (error) {
      console.error("[MAILER] Resend delivery failed:", error);
      return { success: false, error: error.message };
    }

    console.log(`[MAILER] ReviewBite email delivered to ${to} for ${restaurantName}`);
    return { success: true };
  } catch (error) {
    console.error("[MAILER] Unexpected delivery error:", error);
    return { success: false, error: "Unexpected mailer failure" };
  }
}
