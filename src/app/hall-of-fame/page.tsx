"use client";
import { useEffect, useState } from "react";
import Dogu from "@/components/Dogu";

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
    <div style={{ minHeight:"100dvh", background:"#1A0E05", fontFamily:"'Zen Maru Gothic', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap');`}</style>

      <div style={{ background:"#2C1A0E", borderBottom:"0.5px solid #5C3D1E", padding:"16px 24px", display:"flex", alignItems:"center", gap:12 }}>
        <Dogu mood="happy" size={48} />
        <div>
          <p style={{ margin:0, fontSize:18, fontWeight:700, color:"#F5EFE0", letterSpacing:"0.1em" }}>満点殿堂</p>
          <p style={{ margin:0, fontSize:12, color:"#9A7A5A" }}>歴史の旅を完全制覇した者たち</p>
        </div>
        <a href="/" style={{ marginLeft:"auto", padding:"8px 16px", background:"transparent", border:"0.5px solid #5C3D1E", borderRadius:6, color:"#9A7A5A", fontSize:12, textDecoration:"none" }}>
          ← クイズへ
        </a>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px" }}>
        <div style={{ display:"flex", gap:12, marginBottom:24 }}>
          <div style={{ flex:1, background:"#2C1A0E", border:"0.5px solid #5C3D1E", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:32, fontWeight:700, color:"#C8B89A" }}>{count.toLocaleString()}</p>
            <p style={{ margin:"4px 0 0", fontSize:12, color:"#7A5A3A" }}>累計挑戦者数</p>
          </div>
          <div style={{ flex:1, background:"#2C1A0E", border:"0.5px solid #5C3D1E", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <p style={{ margin:0, fontSize:32, fontWeight:700, color:"#C8B89A" }}>{hall.length}</p>
            <p style={{ margin:"4px 0 0", fontSize:12, color:"#7A5A3A" }}>満点達成者</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color:"#7A5A3A", textAlign:"center", fontSize:13 }}>読み込み中…</p>
        ) : hall.length === 0 ? (
          <div style={{ background:"#2C1A0E", border:"0.5px solid #5C3D1E", borderRadius:12, padding:"32px", textAlign:"center" }}>
            <Dogu mood="think" size={64} />
            <p style={{ color:"#7A5A3A", fontSize:14, margin:"16px 0 0" }}>まだ満点達成者はおらぬ…<br/>そなたが最初になるのじゃ！</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {hall.map((entry, i) => (
              <div key={entry.no} style={{
                display:"flex", alignItems:"center", gap:12,
                background:"#2C1A0E", border: i === 0 ? "1px solid #C8B89A" : "0.5px solid #5C3D1E",
                borderRadius:10, padding:"12px 16px"
              }}>
                <div style={{ width:28, textAlign:"center", flexShrink:0 }}>
                  {i === 0 ? <span style={{ fontSize:20 }}>🥇</span> :
                   i === 1 ? <span style={{ fontSize:20 }}>🥈</span> :
                   i === 2 ? <span style={{ fontSize:20 }}>🥉</span> :
                   <span style={{ fontSize:13, color:"#7A5A3A" }}>{i+1}</span>}
                </div>
                {entry.photo ? (
                  <img src={entry.photo} style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"1.5px solid #7B6A4E", flexShrink:0 }} alt={entry.name} />
                ) : (
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"#3D2B1A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🏺</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:500, color:"#F5EFE0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.name}</p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"#7A5A3A" }}>挑戦者 No.{entry.no} · {entry.date}</p>
                </div>
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <p style={{ margin:0, fontSize:18, fontWeight:700, color:"#C8B89A" }}>10</p>
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