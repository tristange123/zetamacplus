interface HelpRequestEmailProps {
  message: string;
  submittedAt: string;
}

export function HelpRequestEmail({ message, submittedAt }: HelpRequestEmailProps) {
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
          maxWidth: "560px",
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
          New help or feature request
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#4b5563",
          }}
        >
          A user submitted the following request from the help page.
        </p>

        <div
          style={{
            margin: "0 0 20px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: "#f9fafb",
            padding: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#1f2937",
            }}
          >
            {message}
          </p>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#6b7280",
          }}
        >
          Submitted at {submittedAt}
        </p>
      </div>
    </div>
  );
}
