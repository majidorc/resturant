export async function sendReviewEmail({
  to,
  restaurantName,
  reviewUrl,
}: {
  to: string;
  restaurantName: string;
  reviewUrl: string;
}) {
  console.log(`[MAILER] Sending 24h follow-up to ${to} for ${restaurantName}`);
  console.log(`[MAILER] Action Target Router link: ${reviewUrl}`);

  // Example implementation skeleton for Resend:
  // await resend.emails.send({
  //   from: 'Feedback <noreply@yourdomain.com>',
  //   to,
  //   subject: `How was your visit to ${restaurantName}?`,
  //   html: `<p>Thanks for visiting us yesterday! Let us know how we did:</p>
  //          <a href="${reviewUrl}?satisfied=true" style="padding: 10px; background: green; color: white;">Loved it! 👍</a>
  //          <a href="${reviewUrl}?satisfied=false" style="padding: 10px; background: red; color: white;">Could be better 👎</a>`
  // });

  return { success: true };
}
