"use client";
import { useRef, useState } from "react";
import DoguFace from "./DoguFace";

interface Props {
  onStart: (files: File[]) => void;
  error: string;
}

export default function UploadScreen({ onStart, error }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfs = Array.from(newFiles).filter((f) => f.type === "application/pdf");
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...pdfs.filter((f) => !existing.has(f.name))];
    });
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <DoguFace mood="idle" size={96} />
          <p style={{ color: "#C8B89A", fontSize: 15, margin: "12px 0 4px", fontFamily: "'Noto Serif JP', serif" }}>
            ぬぅ…砺波の古文書を持参せよ
          </p>
          <p style={{ color: "#7A5A3A", fontSize: 12, margin: 0 }}>
            PDFファイルをまとめてドロップすると謎解きが始まるぞ
          </p>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", background: "#3D1A1A",
            border: "0.5px solid #8A3A3A", borderRadius: 8,
            color: "#F09595", fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: dragging ? "2px dashed #C8B89A" : "1.5px dashed #5C3D1E",
            borderRadius: 12, padding: "2rem", textAlign: "center",
            background: dragging ? "#2C1A0E" : "#1F1208",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>📜</div>
          <p style={{ color: "#9A7A5A", fontSize: 14, margin: 0 }}>
            PDFをここにドロップ<br />
            <span style={{ fontSize: 12, color: "#5C3D1E" }}>（砺波正倉院フォルダごと可）</span>
          </p>
          <input ref={fileRef} type="file" accept="application/pdf" multiple
            style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 200, overflowY: "auto" }}>
            {files.map((f) => (
              <div key={f.name} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 10px", background: "#2C1A0E",
                borderRadius: 6, marginBottom: 4, fontSize: 12, color: "#C8B89A",
              }}>
                <span>📄</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ color: "#7A5A3A", flexShrink: 0 }}>{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((x) => x.name !== f.name)); }}
                  style={{ background: "none", border: "none", color: "#7A5A3A", cursor: "pointer", fontSize: 14 }}
                >✕</button>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#7A5A3A", textAlign: "center", margin: "8px 0 0" }}>
              {files.length}件のPDFを選択中（ランダムに最大5件使用）
            </p>
          </div>
        )}

        <button
          onClick={() => files.length && onStart(files)}
          disabled={!files.length}
          style={{
            width: "100%", marginTop: 20, padding: "14px",
            background: files.length ? "#7B6A4E" : "#2C1A0E",
            color: files.length ? "#F5EFE0" : "#5C3D1E",
            border: "none", borderRadius: 10, fontSize: 15,
            fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.1em",
            cursor: files.length ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {files.length ? "謎解きを始める 🏺" : "まずPDFをアップロードせよ"}
        </button>
      </div>
    </div>
  );
}
