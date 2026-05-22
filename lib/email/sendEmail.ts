import { resend } from "./resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!to || !to.includes("@")) {
      console.warn(`[Email Skipped] Invalid destination address: "${to}"`);
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: "Tokoni <noreply@mail.ed-library.app>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Resend failed to send email:", error);
      return false;
    }

    console.log(`[Email Success] Sent email to ${to} with ID ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email Error] Exception while sending email:", error);
    return false;
  }
}
