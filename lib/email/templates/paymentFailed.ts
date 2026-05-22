export function paymentFailedTemplate({
  vendorName,
  paymentType,
  amount,
  description,
  paymentId,
}: {
  vendorName: string;
  paymentType: "subscription" | "sponsorship";
  amount: number;
  description: string;
  paymentId: string;
}) {
  const typeLabel = paymentType === "subscription" ? "Premium Subscription Upgrade" : "Product Sponsorship Placement";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Failed – Tokoni</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFDFD;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFDFD;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- HEADER / BRAND -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#B9001B;border-radius:10px;padding:8px 10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;">⚠️</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:900;color:#B9001B;letter-spacing:-0.5px;">Tokoni</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.04);">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- ICON BADGE -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#FCE8E6;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">❌</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">Payment Failed</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">Your transaction could not be completed.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${vendorName}</strong>,</p>
                    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                      We attempted to process your payment for <strong>${typeLabel}</strong>, but the transaction was declined or failed to verify. No funds were debited, or if they were, they will be automatically refunded by your card issuer.
                    </p>
                  </td>
                </tr>

                <!-- DETAILS BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#FAF9F9;border:1px solid #f3f3f3;border-radius:16px;overflow:hidden;padding:18px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.8;color:#4b5563;">
                        <tr>
                          <td style="font-weight:600;color:#111827;padding-bottom:6px;" width="130">Description</td>
                          <td style="padding-bottom:6px;">${description}</td>
                        </tr>
                        <tr>
                          <td style="font-weight:600;color:#111827;padding-bottom:6px;">Attempted Amount</td>
                          <td style="padding-bottom:6px;font-weight:700;color:#B9001B;">${amount} NGN</td>
                        </tr>
                        <tr>
                          <td style="font-weight:600;color:#111827;padding-bottom:6px;">Transaction ID</td>
                          <td style="padding-bottom:6px;font-family:monospace;font-size:12px;">${paymentId}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://tokoni.com/dashboard/plans" style="display:inline-block;background-color:#B9001B;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(185,0,27,0.15);">
                      Retry Payment &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      If you have questions, please reach out to our support team.<br/>
                      <strong style="color:#111827;">The Tokoni Team</strong>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;padding-bottom:8px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                This transactional email notification was sent to alert you of a failed payment attempt on Tokoni.<br/>
                &copy; ${new Date().getFullYear()} Tokoni. All rights reserved.
              </p>
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
