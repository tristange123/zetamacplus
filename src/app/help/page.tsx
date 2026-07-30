'use client';

import { useState } from "react";

export default function HelpPage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submitHelpRequest() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("error");
      setErrorMessage("Please enter a help request or feature request.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit help request.");
      }

      setMessage("");
      setStatus("submitted");
    }
    catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm md:p-7">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h1 className="mb-2 text-lg font-semibold text-gray-800">Help / Feature Requests</h1>
          <p className="mb-4 text-sm text-gray-600">
            Send feedback, ask for help, report a bug, or suggest a feature for Zetamac+
          </p>

          <div className="space-y-3">
            <div>
              
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (status === "submitted") {
                    setStatus("idle");
                  }
                }}
                rows={6}
                className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {status === "submitted" && (
              <p className="text-xs font-medium text-green-600">Help has been submitted!</p>
            )}
            {status === "error" && (
              <p className="text-xs font-medium text-red-600">{errorMessage}</p>
            )}

            <button
              type="button"
              onClick={submitHelpRequest}
              disabled={status === "submitting"}
              className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {status === "submitting" ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
