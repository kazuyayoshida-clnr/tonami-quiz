"use client";
import { useEffect, useState } from "react";
import DoguFace from "@/components/DoguFace";

interface Entry {
  no: string;
  name: string;
  score: number;
  photo: string | null;
  date: string;
}

export default function HallOfFame() {
  const [count, setCount] = useState<number>(0);
  const [hall, setHall] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenger")
      .then(r => r.json())
      .then(d => { setCount(d.count || 0); setHall(d.hallOfFame || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight:"100dvh", background:"#1A0E05", fontFamily:"'Noto Sans JP', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600&family=Noto+Sans+JP:wght@400;500&display=swap');`}</style>

      {/* ヘッダー */}
      <div style={{ background:"#2C1A0E", borderBottom:"0.5px solid #5C3D1E", padding:"16px 24px", display:"flex", alignItems:"center", gap:12 }}>
        <DoguFace mood="happy" size={48} />
        <div>
          <p style={{ margin:0, fontSize:18, fontWeight:600, color:"#F5EFE0", fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.1em" }}>
            満点殿堂 🏆
          </p>
          <p style={{ margin:0, fontSize:12, color:"#9A7A5A" }}>砺波の歴史を完全制覇した者たち</p>
        </div>
        <a href="/" style={{ marginLeft:"auto", padding:"8px 16px", background:"transparent", border:"0.5px solid #5C3D1E", borderRadius:6, color:"#9A7A5A", fontSize:12, textDecoration:"none" }}>
          ← クイズへ
        </a>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px" }}>

        {/* 統計 */}
        <div style={{ display:"flex", gap:12, marginBottom:24 }}>
          <div style={{ flex:1, background:"#2C1A0E", border:"0.5px solid #5C3D1E", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:32, fontWeight:700, color:"#C8B89A", fontFamily:"'Noto Serif JP', serif" }}>{count.toLocaleString()}</p>
            <p style={{ margin:"4px 0 0", fontSize:12, color:"#7A5A3A" }}>総挑戦者数</p>
          </div>
          <div style={{ flex:1, background:"#2C1A0E", border:"0.5px solid #5C3D1E", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:32, fontWeight:700, color:"#C8B89A", fontFamily:"'Noto Serif JP', serif" }}>{hall.length}</p>
            <p style={{ margin:"4px 0 0", fontSize:12, color:"#7A5A3A" }}>満点達成者</p>
          </div>
        </div>

        {/* 殿堂リスト */}
        {loading ? (
          <p style={{ color:"#7A5A3A", textAlign:"center", fontSize:13 }}>読み込み中…</p>
        ) : hall.length === 0 ? (
          <div style={{ background:"#2C1A0E", border:"0.5px solid #5C3D1E", borderRadius:12, padding:"32px", textAlign:"center" }}>
            <DoguFace mood="think" size={64} />
            <p style={{ color:"#7A5A3A", fontSize:14, margin:"16px 0 0" }}>まだ満点達成者はおらぬ…<br/>お主が最初になるのじゃ！</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {hall.map((entry, i) => (
              <div key={entry.no} style={{
                display:"flex", alignItems:"center", gap:12,
                background:"#2C1A0E", border: i === 0 ? "1px solid #C8B89A" : "0.5px solid #5C3D1E",
                borderRadius:10, padding:"12px 16px",
                animation:"fadeUp 0.3s ease"
              }}>
                {/* 順位 */}
                <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
                  {i === 0 ? <span style={{ fontSize:20 }}>🥇</span> :
                   i === 1 ? <span style={{ fontSize:20 }}>🥈</span> :
                   i === 2 ? <span style={{ fontSize:20 }}>🥉</span> :
                   <span style={{ fontSize:13, color:"#7A5A3A" }}>{i+1}</span>}
                </div>
                {/* 写真 */}
                {entry.photo ? (
                  <img src={entry.photo} style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"1.5px solid #7B6A4E", flexShrink:0 }} alt={entry.name} />
                ) : (
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"#3D2B1A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>👤</div>
                )}
                {/* 名前・番号 */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:500, color:"#F5EFE0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {entry.name}
                  </p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"#7A5A3A" }}>
                    挑戦者 No.{entry.no} ・ {entry.date}
                  </p>
                </div>
                {/* スコア */}
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <p style={{ margin:0, fontSize:18, fontWeight:700, color:"#C8B89A", fontFamily:"'Noto Serif JP', serif" }}>10</p>
                  <p style={{ margin:0, fontSize:10, color:"#7A5A3A" }}>満点</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
