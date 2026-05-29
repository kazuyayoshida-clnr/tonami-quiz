"use client";

// ほほえみの土偶をデフォルメしたSVGキャラクター
// 特徴：逆三角形の顔、M字ヘア、ほほえみ、お腹を抱えるポーズ、縄文模様

type DoguMood = "idle" | "happy" | "think" | "correct" | "wrong" | "excited" | "talk";

interface Props {
  mood?: DoguMood;
  size?: number;
  animate?: boolean;
}

export default function Dogu({ mood = "idle", size = 120, animate = true }: Props) {
  const colors = {
    body: "#C4956A",
    dark: "#8B5E3C",
    light: "#E8C99A",
    accent: "#5C3317",
    eye: "#3B1F0A",
    shine: "#FFF8F0",
  };

  const getEyes = () => {
    switch (mood) {
      case "happy":
      case "correct":
        return (
          <>
            <path d="M 38 52 Q 43 47 48 52" stroke={colors.eye} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M 72 52 Q 77 47 82 52" stroke={colors.eye} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </>
        );
      case "wrong":
        return (
          <>
            <line x1="36" y1="49" x2="46" y2="55" stroke={colors.eye} strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="46" y1="49" x2="36" y2="55" stroke={colors.eye} strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="70" y1="49" x2="80" y2="55" stroke={colors.eye} strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="80" y1="49" x2="70" y2="55" stroke={colors.eye} strokeWidth="2.5" strokeLinecap="round"/>
          </>
        );
      case "think":
        return (
          <>
            <ellipse cx="42" cy="52" rx="5" ry="4" fill={colors.eye}/>
            <ellipse cx="76" cy="52" rx="5" ry="4" fill={colors.eye}/>
            <ellipse cx="43" cy="51" rx="2" ry="1.5" fill={colors.shine}/>
            <ellipse cx="77" cy="51" rx="2" ry="1.5" fill={colors.shine}/>
          </>
        );
      case "excited":
        return (
          <>
            <ellipse cx="42" cy="51" rx="6" ry="6" fill={colors.eye}/>
            <ellipse cx="76" cy="51" rx="6" ry="6" fill={colors.eye}/>
            <ellipse cx="44" cy="49" rx="2.5" ry="2" fill={colors.shine}/>
            <ellipse cx="78" cy="49" rx="2.5" ry="2" fill={colors.shine}/>
          </>
        );
      default:
        return (
          <>
            <ellipse cx="42" cy="52" rx="5" ry="4.5" fill={colors.eye}/>
            <ellipse cx="76" cy="52" rx="5" ry="4.5" fill={colors.eye}/>
            <ellipse cx="43.5" cy="50.5" rx="2" ry="1.5" fill={colors.shine}/>
            <ellipse cx="77.5" cy="50.5" rx="2" ry="1.5" fill={colors.shine}/>
          </>
        );
    }
  };

  const getMouth = () => {
    switch (mood) {
      case "happy":
      case "correct":
        return <path d="M 48 68 Q 60 78 72 68" stroke={colors.accent} strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
      case "wrong":
        return <path d="M 48 74 Q 60 64 72 74" stroke={colors.accent} strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
      case "excited":
        return (
          <>
            <path d="M 46 66 Q 60 80 74 66" stroke={colors.accent} strokeWidth="2.5" fill={colors.light} strokeLinecap="round"/>
          </>
        );
      default:
        return <path d="M 50 68 Q 60 74 70 68" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round"/>;
    }
  };

  const animClass = animate ? (
    mood === "correct" ? "dogu-jump" :
    mood === "wrong" ? "dogu-shake" :
    mood === "excited" ? "dogu-bounce" :
    "dogu-breathe"
  ) : "";

  return (
    <>
      <style>{`
        @keyframes dogu-breathe {
          0%,100%{transform:scale(1) translateY(0)}
          50%{transform:scale(1.03) translateY(-3px)}
        }
        @keyframes dogu-jump {
          0%,100%{transform:translateY(0)}
          20%{transform:translateY(-20px) rotate(-5deg)}
          40%{transform:translateY(-30px) rotate(5deg)}
          60%{transform:translateY(-15px) rotate(-3deg)}
          80%{transform:translateY(-5px)}
        }
        @keyframes dogu-shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
        @keyframes dogu-bounce {
          0%,100%{transform:translateY(0) scale(1)}
          30%{transform:translateY(-12px) scale(1.05)}
          60%{transform:translateY(-6px) scale(1.02)}
        }
        .dogu-breathe{animation:dogu-breathe 3s ease-in-out infinite}
        .dogu-jump{animation:dogu-jump 0.8s ease-in-out}
        .dogu-shake{animation:dogu-shake 0.6s ease-in-out}
        .dogu-bounce{animation:dogu-bounce 1s ease-in-out infinite}
      `}</style>
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 120 156"
        xmlns="http://www.w3.org/2000/svg"
        className={animClass}
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
      >
        {/* M字ヘア */}
        <path d="M 25 42 Q 30 18 45 22 Q 52 14 60 18 Q 68 14 75 22 Q 90 18 95 42" fill={colors.dark} stroke={colors.accent} strokeWidth="1"/>
        {/* 頭部ハイライト */}
        <ellipse cx="60" cy="40" rx="6" ry="3" fill={colors.dark} opacity="0.4"/>
        {/* 後頭部の線（頭髪表現） */}
        <path d="M 28 48 Q 22 38 26 28" stroke={colors.dark} strokeWidth="1.5" fill="none" opacity="0.6"/>
        <path d="M 92 48 Q 98 38 94 28" stroke={colors.dark} strokeWidth="1.5" fill="none" opacity="0.6"/>

        {/* 顔（逆三角形ベース） */}
        <path d="M 20 38 Q 18 70 60 88 Q 102 70 100 38 Q 90 18 60 18 Q 30 18 20 38 Z" fill={colors.body}/>

        {/* 縄文模様（顔の両側） */}
        <path d="M 24 44 Q 20 50 24 56" stroke={colors.dark} strokeWidth="1.2" fill="none" opacity="0.5"/>
        <path d="M 96 44 Q 100 50 96 56" stroke={colors.dark} strokeWidth="1.2" fill="none" opacity="0.5"/>

        {/* 眉毛 */}
        <path d="M 34 44 Q 42 40 50 43" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 70 43 Q 78 40 86 44" stroke={colors.accent} strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* 目 */}
        {getEyes()}

        {/* 鼻 */}
        <ellipse cx="56" cy="61" rx="2" ry="1.5" fill={colors.accent} opacity="0.6"/>
        <ellipse cx="64" cy="61" rx="2" ry="1.5" fill={colors.accent} opacity="0.6"/>

        {/* 口 */}
        {getMouth()}

        {/* 耳 */}
        <ellipse cx="18" cy="55" rx="5" ry="7" fill={colors.body} stroke={colors.dark} strokeWidth="1"/>
        <ellipse cx="102" cy="55" rx="5" ry="7" fill={colors.body} stroke={colors.dark} strokeWidth="1"/>
        <ellipse cx="18" cy="55" rx="2.5" ry="4" fill={colors.light} opacity="0.5"/>
        <ellipse cx="102" cy="55" rx="2.5" ry="4" fill={colors.light} opacity="0.5"/>

        {/* 胴体 */}
        <path d="M 35 86 Q 28 100 30 120 Q 35 140 60 142 Q 85 140 90 120 Q 92 100 85 86 Q 72 90 60 90 Q 48 90 35 86 Z" fill={colors.body}/>

        {/* 縄文模様（胴体） */}
        <path d="M 40 98 Q 36 106 40 114" stroke={colors.dark} strokeWidth="1.2" fill="none" opacity="0.4"/>
        <path d="M 80 98 Q 84 106 80 114" stroke={colors.dark} strokeWidth="1.2" fill="none" opacity="0.4"/>
        <path d="M 50 102 Q 60 96 70 102" stroke={colors.dark} strokeWidth="1" fill="none" opacity="0.4"/>
        <path d="M 48 112 Q 60 106 72 112" stroke={colors.dark} strokeWidth="1" fill="none" opacity="0.4"/>

        {/* 腕（お腹を抱えるポーズ） */}
        <path d="M 35 92 Q 20 106 30 118 Q 38 122 45 116 Q 42 108 48 102" fill={colors.body} stroke={colors.dark} strokeWidth="1"/>
        <path d="M 85 92 Q 100 106 90 118 Q 82 122 75 116 Q 78 108 72 102" fill={colors.body} stroke={colors.dark} strokeWidth="1"/>

        {/* ほほえみの頬 */}
        <ellipse cx="32" cy="65" rx="7" ry="5" fill="#E8926A" opacity="0.35"/>
        <ellipse cx="88" cy="65" rx="7" ry="5" fill="#E8926A" opacity="0.35"/>

        {/* 思考中の汗・感嘆符 */}
        {mood === "think" && (
          <text x="96" y="30" fontSize="16" fill="#FFD700">？</text>
        )}
        {mood === "correct" && (
          <text x="94" y="28" fontSize="16" fill="#FFD700">⭐</text>
        )}
        {mood === "wrong" && (
          <text x="94" y="28" fontSize="14" fill="#FF6B6B">💦</text>
        )}
        {mood === "excited" && (
          <>
            <text x="92" y="25" fontSize="12" fill="#FFD700">✨</text>
            <text x="8" y="30" fontSize="12" fill="#FFD700">✨</text>
          </>
        )}
      </svg>
    </>
  );
}
