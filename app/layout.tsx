import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "vibe-fun — MCP Apps game server",
  description:
    "An MCP Apps (SEP-1865) server that distributes self-contained HTML mini-games to any MCP host.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: "#faf8ef",
          color: "#776e65",
        }}
      >
        {children}
      </body>
    </html>
  );
}
