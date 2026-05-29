"use client";
import DoguFace from "./DoguFace";
import { DoguMood } from "@/lib/types";

interface Props {
  role: "dogu" | "user";
  content?: string;
  mood?: DoguMood;
  isTyping?: boolean;
}

export default function ChatBubble({ role, content, mood = "idle", isTyping }: Props) {
  const isDogu = role === "dogu";
  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-end",
      flexDirection: isDogu ? "row" : "row-reverse",
      marginBottom: 16,
      animation: "fadeUp 0.3s ease",
    }}>
      {isDogu && <DoguFace mood={mood} size={48} />}
      <div style={{
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: isDogu ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        background: isDogu ? "#3D2B1A" : "#F5EFE0",
        color: isDogu ? "#F5EFE0" : "#2C1A0E",
        fontSize: 14,
        lineHeight: 1.75,
        fontFamily: "'Noto Sans JP', sans-serif",
        border: isDogu ? "none" : "0.5px solid #C8B89A",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {isTyping ? (
          <span style={{ display: "flex", gap: 4, alignItems: "center", height: 20 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#C8B89A",
                display: "inline-block",
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }} />
            ))}
          </span>
        ) : content}
      </div>
      {!isDogu && (
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#C8B89A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>👤</div>
      )}
    </div>
  );
}
