export function newFollowerTemplate(vendorName: string, followerName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Follower – Tokoni</title>
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
                    <span style="color:#ffffff;font-size:18px;font-weight:700;">🤝</span>
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
                    <div style="display:inline-block;background-color:#FCE8E6;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">👋</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">You Have a New Follower!</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">Your vendor reach is expanding on Tokoni.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${vendorName}</strong>,</p>
                    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                       Great news — <strong style="color:#B9001B;">${followerName}</strong> just started following your business profile on Tokoni!
                    </p>
                  </td>
                </tr>

                <!-- FOLLOWER DETAILS BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#FAF9F9;border:1px solid #f3f3f3;border-radius:16px;overflow:hidden;padding:18px 24px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="44" style="vertical-align:middle;">
                            <div style="background-color:#FCE8E6;border-radius:50%;width:44px;height:44px;line-height:44px;text-align:center;font-size:20px;">👤</div>
                          </td>
                          <td style="padding-left:12px;vertical-align:middle;">
                            <p style="margin:0 0 2px 0;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">New Follower</p>
                            <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${followerName}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- MOTIVATOR BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#FFF5F5;border:1px solid #FAD2D2;border-radius:12px;padding:20px 24px;text-align:center;">
                      <p style="margin:0;font-size:14px;color:#B9001B;line-height:1.7;font-weight:500;">
                        ✨ Keep sharing products and publishing reels to engage your audience and drive more sales!
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://tokoni.com/dashboard" style="display:inline-block;background-color:#B9001B;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(185,0,27,0.15);">
                      Manage Business Profile &rarr;
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
                This notification was sent because someone followed your Tokoni store profile.<br/>
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
