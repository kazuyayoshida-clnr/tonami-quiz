"use client";
import { useEffect, useRef, useState } from "react";

export default function BgmProvider({ children }: { children: React.ReactNode }) {
  const [bgmOn, setBgmOn] = useState(true);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/bgm.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    bgmRef.current = audio;

    // 自動再生を試みる
    audio.play().catch(() => {
      // ブロックされた場合：初回タッチで開始
      const startOnInteract = () => {
        audio.play().catch(() => {});
        document.removeEventListener("pointerdown", startOnInteract);
        document.removeEventListener("keydown", startOnInteract);
        document.removeEventListener("touchstart", startOnInteract);
      };
      document.addEventListener("pointerdown", startOnInteract);
      document.addEventListener("keydown", startOnInteract);
      document.addEventListener("touchstart", startOnInteract);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggleBgm = () => {
    setBgmOn(prev => {
      const next = !prev;
      if (bgmRef.current) {
        if (next) bgmRef.current.play().catch(() => {});
        else bgmRef.current.pause();
      }
      return next;
    });
  };

  return (
    <>
      {children}
      {/* BGM ON/OFFボタン（全ページ共通・右上固定） */}
      <button
        onClick={toggleBgm}
        style={{
          position:"fixed", top:12, right:12, zIndex:9999,
          width:48, height:48, borderRadius:"50%",
          background:"rgba(59,31,10,0.85)", border:"2px solid #C8A96E",
          color:"#FFD700", fontSize:20, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}
        aria-label="BGM切り替え"
      >
        {bgmOn ? "🔊" : "🔇"}
      </button>
    </>
  );
}
