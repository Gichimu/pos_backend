import { BrevoClient } from "@getbrevo/brevo";

export async function sendWelcomeEmail(
  to: string,
  firstName: string,
  pin: string,
) {
  const client = new BrevoClient({
    apiKey:
      "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",
  });

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      htmlContent: `<html><head></head><body><p>Hello ${firstName},</p><p>Your PIN is: ${pin}</p></body></html>`,
      sender: {
        email: "hello@brevo.com",
        name: "Alex from POS Team",
      },
      subject: "Welcome to POS!",
      to: [
        {
          email: to,
          name: firstName,
        },
      ],
    });
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}
