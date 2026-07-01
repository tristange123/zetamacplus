interface EmailTemplateProps {
  name: string;
  verificationUrl: string;
}

export function EmailTemplate({ name, verificationUrl }: EmailTemplateProps) {
  return (
    <div
      style={{
        backgroundColor: "#f3f4f6",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <p
          style={{
            margin: "0 0 24px",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.025em",
            color: "#374151",
          }}
        >
          ZetamacPlus
        </p>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "20px",
            fontWeight: 600,
            color: "#1f2937",
          }}
        >
          Verify your email
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#4b5563",
          }}
        >
          Hi {name}, thanks for signing up. Click the button below to confirm
          your email address and start playing.
        </p>

        <a
          href={verificationUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#1f2937",
            color: "#f3f4f6",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
            padding: "10px 16px",
            borderRadius: "6px",
          }}
        >
          Verify email
        </a>

        <p
          style={{
            margin: "24px 0 0",
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#6b7280",
          }}
        >
          If the button does not work, copy and paste this link into your
          browser:
        </p>

        <p
          style={{
            margin: "8px 0 0",
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#6b7280",
            wordBreak: "break-all",
          }}
        >
          {verificationUrl}
        </p>

        <p
          style={{
            margin: "24px 0 0",
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#9ca3af",
          }}
        >
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
}
