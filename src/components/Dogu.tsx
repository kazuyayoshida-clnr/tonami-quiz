"use client";

type DoguMood = "idle" | "happy" | "think" | "correct" | "wrong" | "excited" | "talk";

interface Props {
  mood?: DoguMood;
  size?: number;
  animate?: boolean;
}

export default function Dogu({ mood = "idle", size = 120, animate = true }: Props) {

  // moodに応じて画像を選択
  const getImage = () => {
    switch (mood) {
      case "correct":
      case "excited":
      case "happy":
        return "/dogu-correct.png";
      case "wrong":
        return "/dogu-wrong.png";
      case "think":
      case "talk":
        return "/dogu-hint.png";
      case "idle":
      default:
        return "/dogu-quiz.png";
    }
  };

  // moodに応じてアニメーションクラスを選択
  const getAnimClass = () => {
    if (!animate) return "";
    switch (mood) {
      case "correct":
      case "excited":
        return "dogu-jump";
      case "wrong":
        return "dogu-shake";
      case "happy":
        return "dogu-bounce";
      case "think":
      case "talk":
        return "dogu-sway";
      default:
        return "dogu-float";
    }
  };

  return (
    <>
      <style>{`
        @keyframes dogu-float {
          0%,100%{transform:translateY(0px)}
          50%{transform:translateY(-8px)}
        }
        @keyframes dogu-jump {
          0%,100%{transform:translateY(0) scale(1)}
          20%{transform:translateY(-20px) scale(1.05) rotate(-3deg)}
          40%{transform:translateY(-30px) scale(1.08) rotate(3deg)}
          60%{transform:translateY(-15px) scale(1.05) rotate(-2deg)}
          80%{transform:translateY(-5px) scale(1.02)}
        }
        @keyframes dogu-shake {
          0%,100%{transform:translateX(0) rotate(0deg)}
          20%{transform:translateX(-10px) rotate(-3deg)}
          40%{transform:translateX(10px) rotate(3deg)}
          60%{transform:translateX(-6px) rotate(-2deg)}
          80%{transform:translateX(6px) rotate(2deg)}
        }
        @keyframes dogu-bounce {
          0%,100%{transform:translateY(0) scale(1)}
          30%{transform:translateY(-14px) scale(1.06)}
          60%{transform:translateY(-6px) scale(1.03)}
        }
        @keyframes dogu-sway {
          0%,100%{transform:rotate(0deg)}
          25%{transform:rotate(-4deg)}
          75%{transform:rotate(4deg)}
        }
        .dogu-float{animation:dogu-float 2.5s ease-in-out infinite}
        .dogu-jump{animation:dogu-jump 0.8s ease-in-out}
        .dogu-shake{animation:dogu-shake 0.6s ease-in-out}
        .dogu-bounce{animation:dogu-bounce 1s ease-in-out infinite}
        .dogu-sway{animation:dogu-sway 2s ease-in-out infinite}
      `}</style>
      <img
        src={getImage()}
        alt="ドーグちゃん"
        className={getAnimClass()}
        style={{
          width: size,
          height: size * 1.1,
          objectFit: "contain",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
        }}
      />
    </>
  );
}
