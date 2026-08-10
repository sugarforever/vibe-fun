import { ImageResponse } from "next/og";

export const alt = "vibe-fun — Games for AI, on tap.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#ffffff",
          color: "#111111",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#111111",
              color: "#fff",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            ▚
          </div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>vibe-fun</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.02, letterSpacing: "-2px" }}>
            Games for AI, on tap.
          </div>
          <div style={{ fontSize: 32, color: "#4b5563", maxWidth: 900, lineHeight: 1.35 }}>
            An MCP Apps server that delivers ready-to-play games to any AI host.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["MCP Apps · SEP-1865", "Renders in ChatGPT", "2048 · Sudoku"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 22,
                color: "#111111",
                padding: "8px 20px",
                border: "1px solid #d1d5db",
                borderRadius: 999,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
