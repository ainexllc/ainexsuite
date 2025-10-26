import { serverEnv } from "@/env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

type SmsPayload = {
  to: string;
  body: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (!serverEnv.RESEND_API_KEY || !serverEnv.RESEND_FROM_EMAIL) {
    console.warn("Resend credentials missing; skipping email notification");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: serverEnv.RESEND_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send email reminder", errorText);
    return false;
  }

  return true;
}

export async function sendSms(payload: SmsPayload) {
  if (!serverEnv.TWILIO_ACCOUNT_SID || !serverEnv.TWILIO_AUTH_TOKEN) {
    console.warn("Twilio credentials missing; skipping SMS notification");
    return false;
  }

  const url = new URL(
    `/2010-04-01/Accounts/${serverEnv.TWILIO_ACCOUNT_SID}/Messages.json`,
    "https://api.twilio.com",
  );

  const body = new URLSearchParams({
    To: payload.to,
    Body: payload.body,
  });

  if (serverEnv.TWILIO_FROM_NUMBER) {
    body.set("From", serverEnv.TWILIO_FROM_NUMBER);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${serverEnv.TWILIO_ACCOUNT_SID}:${serverEnv.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send SMS reminder", errorText);
    return false;
  }

  return true;
}
