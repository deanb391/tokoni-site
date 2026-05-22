import { sendEmail } from "./sendEmail";
import { newFollowerTemplate } from "./templates/newFollower";
import { newContentAlertTemplate } from "./templates/newContentAlert";
import { chatMessageDigestTemplate } from "./templates/chatMessageDigest";
import { postEngagementTemplate } from "./templates/postEngagement";
import { paymentSuccessTemplate } from "./templates/paymentSuccess";
import { paymentFailedTemplate } from "./templates/paymentFailed";

export async function sendNewFollowerEmail(to: string, vendorName: string, followerName: string) {
  return sendEmail({
    to,
    subject: "New Follower - Tokoni",
    html: newFollowerTemplate(vendorName, followerName),
  });
}

export async function sendNewContentAlertEmail(
  to: string,
  params: {
    followerName: string;
    vendorName: string;
    contentType: "post" | "product";
    contentName: string;
    linkUrl: string;
  }
) {
  return sendEmail({
    to,
    subject: `New ${params.contentType === "product" ? "Product" : "Post"} from ${params.vendorName} - Tokoni`,
    html: newContentAlertTemplate(params),
  });
}

export async function sendChatMessageDigestEmail(
  to: string,
  params: {
    recipientName: string;
    senders: string[];
    lastMessageSnippet?: string;
    chatLink: string;
  }
) {
  const isMultiple = params.senders.length > 1;
  const subject = isMultiple
    ? `New Messages from ${params.senders.slice(0, 2).join(" and ")}${params.senders.length > 2 ? " and others" : ""} - Tokoni`
    : `New Message from ${params.senders[0]} - Tokoni`;

  return sendEmail({
    to,
    subject,
    html: chatMessageDigestTemplate(params),
  });
}

export async function sendPostEngagementEmail(
  to: string,
  params: {
    vendorName: string;
    triggerUsername: string;
    engagementType: "comment" | "reaction";
    postTitle: string;
    unreadCount: number;
    linkUrl: string;
  }
) {
  const isMultiple = params.unreadCount > 1;
  const actionText = params.engagementType === "comment" ? "commented on" : "reacted to";
  const subject = isMultiple
    ? `You have ${params.unreadCount} new interactions on your post - Tokoni`
    : `${params.triggerUsername} ${actionText} your post - Tokoni`;

  return sendEmail({
    to,
    subject,
    html: postEngagementTemplate(params),
  });
}

export async function sendPaymentSuccessEmail(
  to: string,
  params: {
    vendorName: string;
    paymentType: "subscription" | "sponsorship";
    amount: number;
    description: string;
    paymentId: string;
  }
) {
  return sendEmail({
    to,
    subject: "Payment Successful - Tokoni",
    html: paymentSuccessTemplate(params),
  });
}

export async function sendPaymentFailedEmail(
  to: string,
  params: {
    vendorName: string;
    paymentType: "subscription" | "sponsorship";
    amount: number;
    description: string;
    paymentId: string;
  }
) {
  return sendEmail({
    to,
    subject: "Payment Failed - Tokoni",
    html: paymentFailedTemplate(params),
  });
}
