"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Dogu from "@/components/Dogu";

export default function CertificateContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "なまえなし";
  const score = parseInt(searchParams.get("score") || "0");
  const no = searchParams.get("no") || "----";
  const photoId = searchParams.get("pid") || null;
  const isPerfect = score === 10;

  const [today, setToday] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    setToday(`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`);
  }, []);

  useEffect(() => {
    if (photoId) {
      fetch(`/api/photo?id=${photoId}`)
        .then(r => r.json())
        .then(d => { if (d.photo) setPhoto(d.photo); })
        .catch(() => {});
    } else {
      const saved = sessionStorage.getItem("cert_photo");
      if (saved) setPhoto(saved);
    }
  }, [photoId]);

  useEffect(() => {
    const baseUrl = window.location.href;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(baseUrl)}&color=3B1F0A&bgcolor=F5EFE0`);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#1A0E05",
      fontFamily: "'Zen Maru Gothic', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,215,0,0.3)}50%{box-shadow:0 0 40px rgba(255,215,0,0.6)}}
        .cert-card{animation:fadeUp 0.6s ease, glow 3s ease-in-out infinite}
      `}</style>

      {/* ===== 1ページ目：スクショ用（iPhone12最適化 390×844px） ===== */}
      <div style={{
        width: "100%",
        maxWidth: 390,
        minHeight: 844,
        background: "#1A0E05",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}>
        <div className="cert-card" style={{
          width: "100%",
          background: "linear-gradient(160deg, #FDF6E3, #F5EFE0, #EDE0C8)",
          border: "3px solid #C8A96E",
          borderRadius: 20,
          padding: "20px 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 0 60px rgba(200,169,110,0.1)",
          position: "relative",
          boxSizing: "border-box",
        }}>
          {/* 四隅の装飾 */}
          <div style={{ position:"absolute", top:10, left:10, width:18, height:18, border:"2px solid #C8A96E", borderRight:"none", borderBottom:"none" }}/>
          <div style={{ position:"absolute", top:10, right:10, width:18, height:18, border:"2px solid #C8A96E", borderLeft:"none", borderBottom:"none" }}/>
          <div style={{ position:"absolute", bottom:10, left:10, width:18, height:18, border:"2px solid #C8A96E", borderRight:"none", borderTop:"none" }}/>
          <div style={{ position:"absolute", bottom:10, right:10, width:18, height:18, border:"2px solid #C8A96E", borderLeft:"none", borderTop:"none" }}/>

          {/* 殿堂入りバッジ */}
          {isPerfect && (
            <div style={{ background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", fontSize:12, fontWeight:700, padding:"3px 14px", borderRadius:20, textAlign:"center", marginBottom:10, letterSpacing:"0.15em" }}>
              🏆 殿堂入り
            </div>
          )}

          {/* タイトル */}
          <p style={{ textAlign:"center", fontSize:10, letterSpacing:"0.35em", color:"#8B5E3C", margin:"0 0 3px" }}>
            砺波市埋蔵文化財センター
          </p>
          <h1 style={{ textAlign:"center", fontSize:24, fontWeight:700, color:"#3B1F0A", margin:"0 0 14px", letterSpacing:"0.2em", borderBottom:"1.5px solid #C8A96E", paddingBottom:10 }}>
            受講証明書
          </h1>

          {/* 顔写真 */}
          {photo && (
            <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}>
              <img src={photo} style={{ width:68, height:68, borderRadius:"50%", objectFit:"cover", border:"3px solid #C8A96E" }} alt={name} />
            </div>
          )}

          {/* 名前 */}
          <p style={{ textAlign:"center", fontSize:20, fontWeight:700, color:"#3B1F0A", margin:"0 0 3px", letterSpacing:"0.1em" }}>
            {name}　殿
          </p>
          <p style={{ textAlign:"center", fontSize:10, color:"#8B5E3C", margin:"0 0 14px", fontFamily:"'Zen Maru Gothic', sans-serif" }}>
            挑戦者 No.{no}
          </p>

          {/* 本文 */}
          <div style={{ background:"rgba(200,169,110,0.1)", border:"1px solid #C8A96E", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <p style={{ fontSize:12, color:"#4A2E10", lineHeight:1.9, margin:0, textAlign:"justify" }}>
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
          <p style={{ textAlign:"right", fontSize:12, color:"#6B4226", margin:"0 0 14px" }}>{today}</p>

          {/* 授与者 */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, borderTop:"1px solid #C8A96E", paddingTop:12 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ margin:0, fontSize:10, color:"#8B5E3C", letterSpacing:"0.1em" }}>砺波市埋蔵文化財センター</p>
              <p style={{ margin:"2px 0 0", fontSize:14, fontWeight:700, color:"#3B1F0A", letterSpacing:"0.15em" }}>ドーグちゃん</p>
            </div>
            <Dogu mood="happy" size={56} />
          </div>
        </div>
      </div>

      {/* スクロール促進の矢印 */}
      <div style={{ textAlign:"center", padding:"8px 0", color:"#C8A96E", fontSize:12, fontFamily:"'Zen Maru Gothic', sans-serif" }}>
        ▼ スクロールしてQRコードを見る
      </div>

      {/* ===== 2ページ目：QRコード＋個人情報 ===== */}
      <div style={{
        width: "100%",
        maxWidth: 390,
        padding: "24px 16px 40px",
        boxSizing: "border-box",
      }}>
        {/* QRコード */}
        <div style={{ background:"linear-gradient(160deg,#FDF6E3,#F5EFE0)", border:"2px solid #C8A96E", borderRadius:16, padding:"24px 16px", textAlign:"center", marginBottom:16 }}>
          <p style={{ fontSize:13, color:"#8B5E3C", margin:"0 0 12px", letterSpacing:"0.05em", fontFamily:"'Zen Maru Gothic', sans-serif" }}>
            📱 このQRコードでスマホにも表示できます
          </p>
          {qrUrl && (
            <img src={qrUrl} alt="QRコード" style={{ width:140, height:140, borderRadius:8, border:"1px solid #C8A96E" }} />
          )}
          <p style={{ fontSize:11, color:"#A08060", margin:"10px 0 0", fontFamily:"'Zen Maru Gothic', sans-serif" }}>
            1ページ目をスクリーンショットで保存できます
          </p>
        </div>

        {/* 個人情報の取り扱い */}
        <div style={{ background:"rgba(253,246,227,0.05)", border:"1px solid #5C3D1E", borderRadius:12, padding:"16px" }}>
          <p style={{ fontSize:11, color:"#C8A96E", fontWeight:700, margin:"0 0 8px", letterSpacing:"0.1em", fontFamily:"'Zen Maru Gothic', sans-serif" }}>
            【個人情報の取り扱いについて】
          </p>
          <p style={{ fontSize:11, color:"#9A7A5A", lineHeight:1.9, margin:0, fontFamily:"'Zen Maru Gothic', sans-serif", textAlign:"justify" }}>
            本証明書に使用された顔写真データは、セキュリティ保護の観点より、
            発行から<strong style={{ color:"#C8A96E" }}>3分後に自動的に削除</strong>されます。
            当該データは本証明書の表示目的のみに使用され、
            第三者への提供および他の目的への利用は一切行いません。<br/><br/>
            砺波市埋蔵文化財センター
          </p>
        </div>

        {/* 戻るボタン */}
        <a href="/" style={{ display:"block", marginTop:24, padding:"12px 32px", background:"transparent", color:"#C8A96E", border:"1.5px solid #C8A96E", borderRadius:50, fontSize:14, textDecoration:"none", fontFamily:"'Zen Maru Gothic', sans-serif", textAlign:"center" }}>
          ← クイズにもどる
        </a>
      </div>
    </div>
  );
}
