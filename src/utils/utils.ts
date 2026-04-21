import africastalking from "africastalking";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  apiKey: process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
};

const africastalkingClient = africastalking(credentials);

const sms = africastalkingClient.SMS;

export const sendWelcomeSMS = async (
  number: string,
  firstName: string,
  pin: string,
) => {
  try {
    const message = `Hello ${firstName}, your PIN is ${pin}. Welcome!`;
    const response = await sms.send({
      to: [number],
      from: "POS_APP",
      message: message,
    });
    console.log("SMS sent successfully:", response);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};
