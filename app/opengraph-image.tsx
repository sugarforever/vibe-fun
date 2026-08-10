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
          background: "#0b0d12",
          backgroundImage:
            "radial-gradient(700px 500px at 10% -10%, rgba(124,92,255,0.35), transparent), radial-gradient(700px 500px at 100% 0%, rgba(34,211,238,0.22), transparent)",
          color: "#eaedf3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(100deg,#7c5cff,#22d3ee)",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            ▚
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>vibe-fun</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px" }}>
            Games for AI, on tap.
          </div>
          <div style={{ fontSize: 34, color: "#9ba6b6", maxWidth: 900, lineHeight: 1.35 }}>
            An MCP Apps server that delivers ready-to-play games to any AI host.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["MCP Apps · SEP-1865", "Renders in ChatGPT", "2048 · Sudoku"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 24,
                color: "#c9d2e0",
                padding: "10px 22px",
                border: "1px solid #2a3242",
                borderRadius: 999,
                background: "rgba(255,255,255,0.03)",
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
