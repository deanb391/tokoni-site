export function postEngagementTemplate({
  vendorName,
  triggerUsername,
  engagementType,
  postTitle,
  unreadCount,
  linkUrl,
}: {
  vendorName: string;
  triggerUsername: string;
  engagementType: "comment" | "reaction";
  postTitle: string;
  unreadCount: number;
  linkUrl: string;
}) {
  const isMultiple = unreadCount > 1;
  const actionText = engagementType === "comment" ? "commented on" : "reacted to";
  
  const titleText = isMultiple
    ? `You have ${unreadCount} new engagements on your post`
    : `${triggerUsername} ${actionText} your post`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titleText} – Tokoni</title>
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
                    <span style="color:#ffffff;font-size:18px;font-weight:700;">💬</span>
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
                    <div style="display:inline-block;background-color:#FCE8E6;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">💬</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
                      ${isMultiple ? "New Post Engagement Activities" : "New Post Activity"}
                    </h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">See who is interacting with your business reels on Tokoni.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${vendorName}</strong>,</p>
                    
                    ${
                      isMultiple
                        ? `<p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                             Your post "<strong style="color:#111827;">${postTitle}</strong>" has received <strong style="color:#B9001B;">${unreadCount} new interactions</strong>! Keep creating and uploading content to grow your audience.
                           </p>`
                        : `<p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                             <strong style="color:#B9001B;">${triggerUsername}</strong> has ${actionText} your post "<strong style="color:#111827;">${postTitle}</strong>".
                           </p>`
                    }
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${linkUrl}" style="display:inline-block;background-color:#B9001B;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(185,0,27,0.15);">
                      View Post &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      Best regards,<br/>
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
                This notification was sent because someone interacted with your store content.<br/>
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
