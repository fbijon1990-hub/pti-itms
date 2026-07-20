"use client";
import { useState } from "react";

// Builds the public form URL from the current origin and copies it.
export default function CopyLink({ path, label = "Copy public form link" }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={copy} className="btn-ghost py-1.5 px-3 text-xs">
      {copied ? "Link copied" : label}
    </button>
  );
}
