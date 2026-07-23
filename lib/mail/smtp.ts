import nodemailer from "nodemailer";

type MailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

type MailProvider = "custom_smtp" | "resend";

type SmtpConfig = {
  auth: {
    pass: string;
    user: string;
  };
  from: string;
  host: string;
  port: number;
  secure: boolean;
};

function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST || process.env.SMTP_HOSTNAME;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    (user ? `Atmet <${user}>` : "");

  if (!host || !user || !pass || !from || !Number.isFinite(port)) {
    return null;
  }

  return {
    auth: { pass, user },
    from,
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
  };
}

export function hasCustomSmtpConfig() {
  return Boolean(smtpConfig());
}

function resendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || process.env.SMTP_FROM || process.env.MAIL_FROM;

  if (!apiKey || !from) {
    return null;
  }

  return { apiKey, from };
}

export function hasTransactionalMailConfig() {
  return Boolean(resendConfig() || smtpConfig());
}

async function sendResendMail(payload: MailPayload) {
  const config = resendConfig();

  if (!config) {
    throw new Error("Resend is not configured. Add RESEND_API_KEY and RESEND_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: config.from,
      html: payload.html,
      subject: payload.subject,
      text: payload.text,
      to: [payload.to],
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Resend email failed with status ${response.status}.`);
  }
}

export async function sendTransactionalMail(payload: MailPayload): Promise<MailProvider> {
  if (resendConfig()) {
    await sendResendMail(payload);
    return "resend";
  }

  await sendCustomSmtpMail(payload);
  return "custom_smtp";
}

export async function sendCustomSmtpMail(payload: MailPayload) {
  const config = smtpConfig();

  if (!config) {
    throw new Error(
      "Custom SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.",
    );
  }

  const transporter = nodemailer.createTransport({
    auth: config.auth,
    host: config.host,
    port: config.port,
    secure: config.secure,
  });

  await transporter.sendMail({
    from: config.from,
    html: payload.html,
    subject: payload.subject,
    text: payload.text,
    to: payload.to,
  });
}
