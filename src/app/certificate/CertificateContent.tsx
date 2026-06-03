"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Dogu from "@/components/Dogu";

export default function CertificateContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "なまえなし";
  const score = parseInt(searchParams.get("score") || "0");
  const no = searchParams.get("no") || "----";
  const isPerfect = score === 10;

  const [today, setToday] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    setToday(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`);
    // sessionStorageから写真を取得
    const saved = sessionStorage.getItem("cert_photo");
    if (saved) setPhoto(saved);
  }, []);

  useEffect(() => {
    // QRコードはURLのみ（写真なし）で生成
    const baseUrl = window.location.origin + window.location.pathname + window.location.search;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(baseUrl)}&color=3B1F0A&bgcolor=F5EFE0`);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#1A0E05",
      fontFamily: "'Noto Serif JP', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&family=Noto+Sans+JP:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.3)}50%{box-shadow:0 0 40px rgba(255,215,0,0.6)}}
        .cert-card{animation:fadeUp 0.6s ease, glow 3s ease-in-out infinite}
      `}</style>

      <div className="cert-card" style={{
        width: "100%", maxWidth: 420,
        background: "linear-gradient(160deg, #FDF6E3, #F5EFE0, #EDE0C8)",
        border: "3px solid #C8A96E", borderRadius: 20, padding: "28px 24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 60px rgba(200,169,110,0.1)",
        position: "relative", overflow: "hidden",
      }}>
        {/* 四隅の装飾 */}
        <div style={{ position:"absolute", top:10, left:10, width:20, height:20, border:"2px solid #C8A96E", borderRight:"none", borderBottom:"none" }}/>
        <div style={{ position:"absolute", top:10, right:10, width:20, height:20, border:"2px solid #C8A96E", borderLeft:"none", borderBottom:"none" }}/>
        <div style={{ position:"absolute", bottom:10, left:10, width:20, height:20, border:"2px solid #C8A96E", borderRight:"none", borderTop:"none" }}/>
        <div style={{ position:"absolute", bottom:10, right:10, width:20, height:20, border:"2px solid #C8A96E", borderLeft:"none", borderTop:"none" }}/>

        {/* 殿堂入りバッジ */}
        {isPerfect && (
          <div style={{ background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", fontSize:13, fontWeight:700, padding:"4px 16px", borderRadius:20, textAlign:"center", marginBottom:12, letterSpacing:"0.15em" }}>
            🏆 殿堂入り
          </div>
        )}

        {/* タイトル */}
        <p style={{ textAlign:"center", fontSize:11, letterSpacing:"0.4em", color:"#8B5E3C", margin:"0 0 4px" }}>砺波市埋蔵文化財センター</p>
        <h1 style={{ textAlign:"center", fontSize:26, fontWeight:700, color:"#3B1F0A", margin:"0 0 16px", letterSpacing:"0.2em", borderBottom:"1.5px solid #C8A96E", paddingBottom:12 }}>
          受講証明書
        </h1>

        {/* 顔写真 */}
        {photo && (
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <img src={photo} style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:"3px solid #C8A96E" }} alt={name} />
          </div>
        )}

        {/* 名前 */}
        <p style={{ textAlign:"center", fontSize:22, fontWeight:700, color:"#3B1F0A", margin:"0 0 4px", letterSpacing:"0.1em" }}>
          {name}　殿
        </p>
        <p style={{ textAlign:"center", fontSize:11, color:"#8B5E3C", margin:"0 0 16px", fontFamily:"'Noto Sans JP', sans-serif" }}>
          挑戦者 No.{no}
        </p>

        {/* 本文 */}
        <div style={{ background:"rgba(200,169,110,0.1)", border:"1px solid #C8A96E", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ fontSize:13, color:"#4A2E10", lineHeight:2, margin:0, textAlign:"justify" }}>
            あなたは「となみの れきし なぞとき クイズ」において、
            砺波の歴史と文化について熱心に学ばれ、
            見事 <strong>{score}問</strong> を正解されました。
            {isPerfect
              ? "全問正解という快挙を称え、ここに殿堂入りとして表彰いたします。"
              : "その探求心と学びの姿勢を讃え、ここに受講を証明いたします。"
            }
          </p>
        </div>

        {/* 日付 */}
        <p style={{ textAlign:"right", fontSize:13, color:"#6B4226", margin:"0 0 16px" }}>{today}</p>

        {/* 授与者 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:12, borderTop:"1px solid #C8A96E", paddingTop:14, marginBottom:20 }}>
          <div style={{ textAlign:"right" }}>
            <p style={{ margin:0, fontSize:11, color:"#8B5E3C", letterSpacing:"0.1em" }}>砺波市埋蔵文化財センター</p>
            <p style={{ margin:"2px 0 0", fontSize:15, fontWeight:700, color:"#3B1F0A", letterSpacing:"0.15em" }}>ドーグちゃん</p>
          </div>
          <Dogu mood="happy" size={60} />
        </div>

        {/* QRコード */}
        <div style={{ borderTop:"1px dashed #C8A96E", paddingTop:16, textAlign:"center" }}>
          <p style={{ fontSize:11, color:"#8B5E3C", margin:"0 0 8px", letterSpacing:"0.1em" }}>
            📱 このQRコードでスマホにも表示できます
          </p>
          {qrUrl && (
            <img src={qrUrl} alt="QRコード" style={{ width:120, height:120, borderRadius:8, border:"1px solid #C8A96E" }} />
          )}
          <p style={{ fontSize:10, color:"#A08060", margin:"8px 0 0" }}>スクリーンショットで保存できます</p>
        </div>
      </div>

      <a href="/" style={{ marginTop:24, padding:"12px 32px", background:"transparent", color:"#C8A96E", border:"1.5px solid #C8A96E", borderRadius:50, fontSize:14, textDecoration:"none", fontFamily:"'Noto Sans JP', sans-serif" }}>
        ← クイズにもどる
      </a>
    </div>
  );
}
