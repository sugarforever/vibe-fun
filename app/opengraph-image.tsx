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
          padding: "64px",
          background: "#fbfbf9",
          color: "#1c293c",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fdc800",
              border: "4px solid #1c293c",
              boxShadow: "5px 5px 0 #1c293c",
              fontSize: 30,
              fontWeight: 900,
            }}
          >
            ▚
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>vibe-fun</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 84, fontWeight: 900, lineHeight: 1.02, letterSpacing: "-3px" }}>
            <span>Games for&nbsp;</span>
            <span style={{ background: "#fdc800", border: "3px solid #1c293c", padding: "0 14px", boxShadow: "5px 5px 0 #1c293c", borderRadius: 6 }}>AI</span>
            <span>, on tap.</span>
          </div>
          <div style={{ fontSize: 32, color: "#55617a", maxWidth: 920, lineHeight: 1.35 }}>
            An MCP Apps server that delivers ready-to-play games to any AI host.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["MCP Apps · SEP-1865", "Renders in ChatGPT", "2048 · Sudoku"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1c293c",
                padding: "8px 18px",
                background: "#fff",
                border: "3px solid #1c293c",
                boxShadow: "3px 3px 0 #1c293c",
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
