import { jsx } from "react/jsx-runtime";
import { HelpRequestEmail } from "@/components/helpRequestEmail";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const HELP_REQUEST_TO = "tqg9928@nyu.edu";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("message" in body) ||
      typeof body.message !== "string"
    ) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const message = body.message.trim();
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/New_York",
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "METAMAC <onboarding@resend.dev>",
      to: [HELP_REQUEST_TO],
      subject: "New Zetamac+ help or feature request",
      react: jsx(HelpRequestEmail, { message, submittedAt }),
    });

    if (error) {
      console.error("Failed to send help request email:", error);
      return NextResponse.json({ error: "Failed to send help request" }, { status: 500 });
    }

    return NextResponse.json({ message: "Help request submitted" }, { status: 201 });
  }
  catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
