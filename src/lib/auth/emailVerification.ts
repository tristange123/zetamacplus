import { jsx } from "react/jsx-runtime";
import { EmailTemplate } from "@/components/verificationEmail";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailProps = {
  to: string;
  subject: string;
  name: string;
  verificationUrl: string;
};

export async function sendEmail({
  to,
  subject,
  name,
  verificationUrl,
}: SendEmailProps) {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? "METAMAC <onboarding@resend.dev>",
    to: [to],
    subject,
    react: jsx(EmailTemplate, { name, verificationUrl }),
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error(error.message);
  }
}
