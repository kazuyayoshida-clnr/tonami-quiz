"use client";

interface Props {
  choices: string[];
  onSelect: (i: number) => void;
  selected: number | null;
  correct: number;
}

export default function ChoiceButtons({ choices, onSelect, selected, correct }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, paddingLeft: 58 }}>
      {choices.map((c, i) => {
        let bg = "#F5EFE0", border = "0.5px solid #C8B89A", color = "#2C1A0E";
        if (selected !== null) {
          if (i === correct)       { bg = "#E1F5EE"; border = "1.5px solid #1D9E75"; color = "#0F6E56"; }
          else if (i === selected) { bg = "#FCEBEB"; border = "1.5px solid #E24B4A"; color = "#A32D2D"; }
          else                     { bg = "#F5F0EA"; color = "#9A8A7A"; }
        }
        return (
          <button key={i}
            onClick={() => selected === null && onSelect(i)}
            style={{
              padding: "10px 16px", borderRadius: 8, border, background: bg, color,
              fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif",
              textAlign: "left", cursor: selected === null ? "pointer" : "default",
              transition: "all 0.15s", lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600, marginRight: 8 }}>{"ＡＢＣＤ"[i]}．</span>{c}
          </button>
        );
      })}
    </div>
  );
}
