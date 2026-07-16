"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Dogu from "./Dogu";
import { allQuestions } from "@/lib/questions";

type Phase = "title" | "warp" | "register" | "camera" | "quiz" | "result";
type Mood = "idle" | "happy" | "think" | "correct" | "wrong" | "excited" | "talk";

function Particles() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <style>{`
        @keyframes float1{0%{transform:translateY(100vh) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-10vh) rotate(720deg);opacity:0}}
        @keyframes float2{0%{transform:translateY(100vh) translateX(0);opacity:0}50%{transform:translateY(50vh) translateX(30px);opacity:0.8}100%{transform:translateY(-10vh) translateX(-20px);opacity:0}}
        ${Array.from({length:20},(_,i)=>`
          .p${i}{
            position:absolute;
            left:${Math.random()*100}%;
            width:${4+Math.random()*8}px;
            height:${4+Math.random()*8}px;
            background:${['#FFD700','#C8A96E','#E8C99A','#FFF8E7','#D4A853'][Math.floor(Math.random()*5)]};
            border-radius:50%;
            animation:float${Math.random()>0.5?1:2} ${8+Math.random()*12}s ${Math.random()*8}s infinite linear;
            opacity:0.6;
          }
        `).join('')}
      `}</style>
      {Array.from({length:20},(_,i)=><div key={i} className={`p${i}`}/>)}
    </div>
  );
}

function WarpEffect({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  const years = ["2024","1868","1603","1333","794","710","弥生","縄文","旧石器"];

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:100, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <style>{`
        @keyframes warp-in{0%{opacity:0;transform:scale(3)}100%{opacity:1;transform:scale(1)}}
        @keyframes year-fly{0%{transform:translateY(100px) scale(0.5);opacity:0}30%{opacity:1}70%{opacity:1}100%{transform:translateY(-200px) scale(2);opacity:0}}
        @keyframes tunnel{0%{transform:scale(0) rotate(0deg);opacity:0.8}100%{transform:scale(20) rotate(180deg);opacity:0}}
        .warp-circle{animation:tunnel 2.8s ease-in forwards}
        .year-item{animation:year-fly 0.4s ease-out forwards}
      `}</style>
      {[1,2,3,4,5].map(i=>(
        <div key={i} className="warp-circle" style={{ position:"absolute", width:`${i*60}px`, height:`${i*60}px`, border:`${4-i*0.5}px solid`, borderColor:['#FFD700','#C8A96E','#FFF','#D4A853','#8B5E3C'][i-1], borderRadius:"50%", animationDelay:`${i*0.1}s` }}/>
      ))}
      <div style={{ position:"absolute", inset:0, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:16 }}>
        {years.map((y,i)=>(
          <div key={y} className="year-item" style={{ color:["#FFD700","#FFF","#C8A96E","#E8C99A"][i%4], fontSize:`${20+Math.random()*24}px`, fontWeight:700, fontFamily:"'Zen Maru Gothic', sans-serif", animationDelay:`${i*0.25}s`, textShadow:"0 0 20px currentColor" }}>{y}</div>
        ))}
      </div>
      <p style={{ color:"#FFD700", fontSize:18, fontFamily:"'Zen Maru Gothic', sans-serif", zIndex:10, textShadow:"0 0 20px #FFD700", animation:"warp-in 0.5s ease-out" }}>ときをこえて…</p>
    </div>
  );
}

// 選択肢をシャッフルして正解インデックスを再計算
function shuffleChoices(q: typeof allQuestions[0]) {
  const correctChoice = q.choices[q.answer]; // 正解テキストを保持
  const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
  const newAnswerIndex = shuffled.indexOf(correctChoice);
  return { ...q, choices: shuffled, answer: newAnswerIndex };
}

// ランダムに10問選択（重複なし）＋選択肢シャッフル
function getRandomQuestions() {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10).map(shuffleChoices);
}

export default function QuizApp() {
  const [gameQuestions, setGameQuestions] = useState(() => getRandomQuestions());
  const [judgeMark, setJudgeMark] = useState<"correct" | "wrong" | null>(null);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const nextCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const nextCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bgmOn, setBgmOn] = useState(true);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<Phase>("title");
  const [mood, setMood] = useState<Mood>("idle");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [challengerNo, setChallengerNo] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [doguMessage, setDoguMessage] = useState("いっしょに となみたびをしようね！");
  const [showResult, setShowResult] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timerActive && timeLeft === 0) {
      handleTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerActive, timeLeft]);

  const handleTimeout = useCallback(() => {
    if (selected !== null) return;
    setSelected(-1);
    setTimerActive(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setMood("wrong");
    setDoguMessage(`じかんぎれ！せいかいは「${gameQuestions[qIndex].choices[gameQuestions[qIndex].answer]}」だったよ。つぎがんばろうね！`);
    setJudgeMark("wrong");
    setTimeout(() => setJudgeMark(null), 1500);
    setNextCountdown(10);
    nextCountdownIntervalRef.current = setInterval(() => {
      setNextCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (nextCountdownIntervalRef.current) clearInterval(nextCountdownIntervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    nextCountdownRef.current = setTimeout(() => {
      if (nextCountdownIntervalRef.current) clearInterval(nextCountdownIntervalRef.current);
      setNextCountdown(null);
      nextQuestion(false);
    }, 10000);
  }, [selected, qIndex]);

  const startQuestion = useCallback((idx: number) => {
    setQIndex(idx);
    setSelected(null);
    setTimeLeft(60);
    setTimerActive(true);
    setMood("idle");
    setDoguMessage("さあ、もんだいだよ！かんがえてみてね！");
    // 10秒後にヒントを表示
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setMood("think");
      setDoguMessage(gameQuestions[idx].hint + "…ヒントだよ！");
    }, 10000);
  }, []);

  const startQuiz = useCallback(() => {
    setGameQuestions(getRandomQuestions());
    setScore(0);
    setShowResult(false);
    startQuestion(0);
    setPhase("quiz");
  }, [startQuestion]);

  const nextQuestion = useCallback((correct: boolean) => {
    const next = qIndex + 1;
    if (next >= gameQuestions.length) {
      setTimerActive(false);
      setPhase("result");
      setShowResult(true);
      const fs = correct ? score + 1 : score;
      if (fs === 10) setMood("excited");
      else if (fs >= 7) setMood("happy");
      else setMood("idle");
      fetch("/api/challenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName || "なまえなし", score: fs, photo: userPhoto }),
      }).then(r => r.json()).then(d => {
        if (d.no) { setChallengerNo(d.no); setTotalCount(d.count); }
      }).catch(() => {});
    } else {
      setTimeout(() => startQuestion(next), 500);
    }
  }, [qIndex, score, userName, userPhoto, startQuestion]);

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimerActive(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    const q = gameQuestions[qIndex];
    const isCorrect = idx === q.answer;
    if (isCorrect) {
      setScore(s => s + 1);
      setMood("correct");
      setDoguMessage("やったー！🎉 せいかい！" + q.explanation);
      setJudgeMark("correct");
    } else {
      setMood("wrong");
      setDoguMessage("ざんねん💦 せいかいは「" + q.choices[q.answer] + "」だよ。" + q.explanation);
      setJudgeMark("wrong");
    }
    setTimeout(() => setJudgeMark(null), 1500);
    // 10秒後に自動で次の問題へ
    setNextCountdown(10);
    nextCountdownIntervalRef.current = setInterval(() => {
      setNextCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (nextCountdownIntervalRef.current) clearInterval(nextCountdownIntervalRef.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    nextCountdownRef.current = setTimeout(() => {
      if (nextCountdownIntervalRef.current) clearInterval(nextCountdownIntervalRef.current);
      setNextCountdown(null);
      nextQuestion(isCorrect);
    }, 10000);
  }, [selected, qIndex, nextQuestion]);

  const startCamera = useCallback(async () => {
    setCameraError(""); setIsCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); setIsCameraReady(true); };
      }
    } catch { setCameraError("カメラがつかえないよ。スキップして すすもう！"); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; setIsCameraReady(false);
  }, []);

  useEffect(() => {
    if (phase === "camera") startCamera();
    else stopCamera();
  }, [phase, startCamera, stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth || 320; c.height = v.videoHeight || 240;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.save(); ctx.scale(-1,1); ctx.drawImage(v,-c.width,0,c.width,c.height); ctx.restore();
    const photoData = c.toDataURL("image/jpeg", 0.8);
    setUserPhoto(photoData);
    // Redisに写真を保存してIDを取得
    fetch("/api/photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: photoData }),
    }).then(r => r.json()).then(d => {
      if (d.id) setPhotoId(d.id);
    }).catch(() => {});
    stopCamera(); startQuiz();
  }, [stopCamera, startQuiz]);

  // BGM常時再生（ページ読み込み時に自動再生を試行、ブロック時は初回タッチで開始）
  useEffect(() => {
    const audio = new Audio("/bgm.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    bgmRef.current = audio;

    // まず自動再生を試みる
    audio.play().catch(() => {
      // ブロックされた場合：初回のユーザー操作で再生開始
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

  // BGM ON/OFF切り替え
  const toggleBgm = useCallback(() => {
    setBgmOn(prev => {
      const next = !prev;
      if (bgmRef.current) {
        if (next) bgmRef.current.play().catch(() => {});
        else bgmRef.current.pause();
      }
      return next;
    });
  }, []);

  // 次の問題へ（早送り）
  const goNextQuestion = useCallback((isCorrect: boolean) => {
    if (nextCountdownRef.current) clearTimeout(nextCountdownRef.current);
    if (nextCountdownIntervalRef.current) clearInterval(nextCountdownIntervalRef.current);
    setNextCountdown(null);
    nextQuestion(isCorrect);
  }, [nextQuestion]);

  const reset = () => {
    setPhase("title"); setMood("idle"); setScore(0); setQIndex(0);
    setSelected(null); setUserPhoto(null); setUserName("");
    setChallengerNo(null); setTotalCount(null); setShowResult(false);
    setTimerActive(false); setTimeLeft(60); setPhotoId(null);
    setDoguMessage("いっしょに となみたびをしようね！");
    sessionStorage.removeItem("cert_photo");
  };

  // 証明書URL生成
  const getCertUrl = () => {
    if (userPhoto) sessionStorage.setItem("cert_photo", userPhoto);
    const params = new URLSearchParams({
      name: userName || "なまえなし",
      score: String(score),
      no: challengerNo || "----",
    });
    if (photoId) params.set("pid", photoId);
    return `/certificate?${params.toString()}`;
  };

  const q = gameQuestions[qIndex];
  const btnColors = ["#E8392A","#2A6AE8","#2AAE2A","#E8A02A"];
  const btnLabels = ["Ａ","Ｂ","Ｃ","Ｄ"];

  return (
    <div style={{ minHeight:"100dvh", background:"#1A0A00", fontFamily:"'Zen Maru Gothic', sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes titleGlow{0%,100%{text-shadow:0 0 20px #FFD700,0 0 40px #C8A96E}50%{text-shadow:0 0 40px #FFD700,0 0 80px #C8A96E,0 0 120px #FFF8E7}}
        @keyframes btnPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes timerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
        .title-text{animation:titleGlow 2s ease-in-out infinite}
        .start-btn{animation:btnPulse 2s ease-in-out infinite}
        .timer-urgent{animation:timerPulse 0.5s ease-in-out infinite;color:#FF4444 !important}
        @keyframes judgePop{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.15) rotate(3deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes judgeFade{0%{opacity:1}70%{opacity:1}100%{opacity:0}}
        ruby rt{font-size:0.55em;color:#C8A96E}
      `}</style>

      {phase !== "warp" && <Particles />}

      {/* BGM ON/OFFボタン（クイズ中は非表示） */}
      {phase !== "quiz" && <button
        onClick={toggleBgm}
        style={{
          position:"fixed", top:12, right:12, zIndex:150,
          width:48, height:48, borderRadius:"50%",
          background:"rgba(59,31,10,0.85)", border:"2px solid #C8A96E",
          color:"#FFD700", fontSize:20, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}
        aria-label="BGM切り替え"
      >
        {bgmOn ? "🔊" : "🔇"}
      </button>}

      {phase === "warp" && <WarpEffect onDone={() => setPhase("register")} />}

      {/* タイトル画面 */}
      {phase === "title" && (
        <div style={{ position:"relative", zIndex:1, minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
          <div style={{ marginBottom:8 }}>
            <p style={{ color:"#C8A96E", fontSize:13, letterSpacing:"0.3em", margin:"0 0 8px", fontFamily:"'Zen Maru Gothic', sans-serif" }}>砺波市埋蔵文化財センター</p>
            <h1 className="title-text" style={{ color:"#FFD700", fontSize:32, fontWeight:700, margin:0, fontFamily:"'Zen Maru Gothic', sans-serif", letterSpacing:"0.15em", lineHeight:1.3 }}>
              ほほえみの土偶と<br/>ゆく<br/>となみれきし<br/>なぞとき
            </h1>
          </div>
          <div style={{ margin:"16px 0" }}><Dogu mood="welcome" size={130} /></div>
          <div style={{ background:"rgba(200,169,110,0.15)", border:"1.5px solid #C8A96E", borderRadius:16, padding:"12px 20px", marginBottom:24, maxWidth:300 }}>
            <p style={{ color:"#FFE8A0", fontSize:15, margin:0, lineHeight:1.8, fontFamily:"'Zen Maru Gothic', sans-serif" }}>
              ねえ！わたしは<br/>「ドーグちゃん」だよ！<br/>いっしょに どこかへ たびして<br/>となみの れきしを まなぼうね！
            </p>
          </div>
          <button className="start-btn" onClick={() => setPhase("warp")} style={{ padding:"16px 40px", background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", border:"none", borderRadius:50, fontSize:18, fontWeight:700, cursor:"pointer", fontFamily:"'Zen Maru Gothic', sans-serif", boxShadow:"0 4px 20px rgba(255,215,0,0.5)", letterSpacing:"0.1em", marginBottom:16 }}>
            🌟 たびに でかける！
          </button>
          <a href="/hall-of-fame" style={{ color:"#C8A96E", fontSize:13, textDecoration:"none", fontFamily:"'Zen Maru Gothic', sans-serif" }}>🏛 まんてんでんどうをみる</a>
        </div>
      )}

      {/* とうろく画面 */}
      {phase === "register" && (
        <div style={{ position:"relative", zIndex:1, minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
          <Dogu mood="idle" size={100} />
          <div style={{ background:"rgba(200,169,110,0.15)", border:"1.5px solid #C8A96E", borderRadius:16, padding:"12px 20px", margin:"12px 0 20px", maxWidth:300, textAlign:"center" }}>
            <p style={{ color:"#FFE8A0", fontSize:15, margin:0, lineHeight:1.8, fontFamily:"'Zen Maru Gothic', sans-serif" }}>なまえを おしえてね！<br/>（なしでもいいよ！）</p>
          </div>
          <input type="text" value={userName} onChange={e => setUserName(e.target.value)} onKeyDown={e => e.key==="Enter" && setPhase("camera")} placeholder="なまえを にゅうりょく" maxLength={12}
            style={{ width:"100%", maxWidth:320, padding:"14px 16px", background:"rgba(255,255,255,0.1)", border:"2px solid #C8A96E", borderRadius:12, color:"#FFE8A0", fontSize:18, textAlign:"center", fontFamily:"'Zen Maru Gothic', sans-serif", marginBottom:16, boxSizing:"border-box" }}
          />
          <button onClick={() => setPhase("camera")} style={{ width:"100%", maxWidth:320, padding:"14px", background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", border:"none", borderRadius:50, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Zen Maru Gothic', sans-serif", marginBottom:10 }}>📷 しゃしんをとる →</button>
          <button onClick={() => startQuiz()} style={{ width:"100%", maxWidth:320, padding:"12px", background:"transparent", color:"#C8A96E", border:"1.5px solid #C8A96E", borderRadius:50, fontSize:14, cursor:"pointer", fontFamily:"'Zen Maru Gothic', sans-serif" }}>しゃしんなしで はじめる</button>
        </div>
      )}

      {/* カメラ画面 */}
      {phase === "camera" && (
        <div style={{ position:"relative", zIndex:1, minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, gap:16 }}>
          <Dogu mood="idle" size={80} />
          <p style={{ color:"#FFE8A0", fontSize:15, fontFamily:"'Zen Maru Gothic', sans-serif" }}>かおをまんなかに あわせてね📷</p>
          <div style={{ position:"relative", width:"100%", maxWidth:360, borderRadius:16, overflow:"hidden", background:"#2C1A0E", border:"2px solid #C8A96E", aspectRatio:"4/3" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:isCameraReady?"block":"none" }} />
            {!isCameraReady && !cameraError && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"#C8A96E" }}>カメラ きどうちゅう…</p></div>}
            {cameraError && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}><p style={{ color:"#FF9090", textAlign:"center", fontSize:13 }}>{cameraError}</p></div>}
          </div>
          <canvas ref={canvasRef} style={{ display:"none" }} />
          {isCameraReady && (
            <button onClick={takePhoto} style={{ padding:"14px 40px", background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", border:"none", borderRadius:50, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Zen Maru Gothic', sans-serif" }}>📸 とる！</button>
          )}
          <button onClick={() => startQuiz()} style={{ padding:"12px 32px", background:"transparent", color:"#C8A96E", border:"1.5px solid #C8A96E", borderRadius:50, fontSize:14, cursor:"pointer" }}>スキップして はじめる</button>
        </div>
      )}

      {/* クイズ画面（大画面ワイドレイアウト・固定レイアウト） */}
      {phase === "quiz" && q && (
        <div style={{
          position:"relative", zIndex:1,
          height:"100dvh", display:"flex", flexDirection:"column",
          padding:"1vh 2vw", boxSizing:"border-box", overflow:"hidden"
        }}>

          {/* ⭕ 全画面ジャッジオーバーレイ（正解時のみ） */}
          {judgeMark === "correct" && (
            <div style={{
              position:"fixed", inset:0, zIndex:200,
              display:"flex", alignItems:"center", justifyContent:"center",
              background:"rgba(29,158,117,0.25)",
              animation:"judgeFade 1.5s ease forwards", pointerEvents:"none",
            }}>
              <span style={{
                fontSize:"min(55vw,55vh)", fontWeight:900, lineHeight:1,
                color:"#4DFFC0",
                textShadow:"0 0 80px #1D9E75, 0 0 160px #4DFFC0",
                animation:"judgePop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              }}>⭕</span>
            </div>
          )}

          {/* ヘッダー行（高さ固定：12vh） */}
          <div style={{ height:"12vh", display:"flex", alignItems:"center", gap:"1.5vw", flexShrink:0 }}>
            <div style={{ background:"linear-gradient(135deg,#3B1F0A,#5C3317)", border:"2px solid #C8A96E", borderRadius:16, padding:"0.5vh 1.5vw", textAlign:"center", flexShrink:0, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <p style={{ margin:0, fontSize:"clamp(10px,1.1vw,16px)", color:"#C8A96E" }}>だい</p>
              <p style={{ margin:0, fontSize:"clamp(22px,3vw,44px)", color:"#FFD700", fontWeight:700, lineHeight:1.1 }}>{qIndex+1}<span style={{ fontSize:"clamp(11px,1.3vw,18px)", color:"#C8A96E" }}>もん</span></p>
            </div>
            <div style={{ background:"#FFD700", color:"#3B1F0A", fontSize:"clamp(12px,1.4vw,22px)", fontWeight:700, padding:"0.8vh 1.5vw", borderRadius:30, flexShrink:0, whiteSpace:"nowrap", overflow:"hidden", maxWidth:"20vw", textOverflow:"ellipsis" }}>{q.category}</div>
            <div style={{ flex:1 }}>
              <div style={{ height:"clamp(8px,1.2vh,14px)", background:"rgba(0,0,0,0.4)", borderRadius:8, overflow:"hidden", border:"1px solid #C8A96E" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#FFD700,#C8A96E)", width:`${((qIndex)/gameQuestions.length)*100}%`, transition:"width 0.5s ease", borderRadius:8 }} />
              </div>
              <p style={{ margin:"0.3vh 0 0", fontSize:"clamp(10px,1.2vw,16px)", color:"#C8A96E", textAlign:"center" }}>せいかい {score}もん / {gameQuestions.length}もん</p>
            </div>
            <div style={{ background:"rgba(0,0,0,0.4)", borderRadius:16, padding:"0.5vh 1.5vw", border:"2px solid #C8A96E", textAlign:"center", minWidth:"7vw", flexShrink:0, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <p style={{ margin:0, fontSize:"clamp(9px,1vw,14px)", color:"#C8A96E" }}>のこり</p>
              <p className={timeLeft <= 10 ? "timer-urgent" : ""} style={{ margin:0, fontSize:"clamp(26px,3.4vw,52px)", color:"#FFD700", fontWeight:700, lineHeight:1.1 }}>{timeLeft}</p>
            </div>
            {userPhoto && <img src={userPhoto} style={{ height:"8vh", width:"8vh", borderRadius:"50%", objectFit:"cover", border:"3px solid #C8A96E", flexShrink:0 }} alt="you" />}
          </div>

          {/* 問題文（高さ固定：22vh・文字サイズ自動調整） */}
          <div style={{
            height:"22vh", flexShrink:0,
            background:"linear-gradient(135deg,rgba(59,31,10,0.95),rgba(92,51,23,0.95))",
            border:"3px solid #C8A96E", borderRadius:20, padding:"1.5vh 3vw",
            boxShadow:"0 6px 24px rgba(0,0,0,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            overflow:"hidden", marginBottom:"1vh",
          }}>
            <p style={{
              margin:0,
              fontSize:"clamp(14px,2.2vw,34px)",
              color:"#FFE8A0", lineHeight:1.7,
              fontWeight:600, textAlign:"center",
              overflow:"hidden",
              display:"-webkit-box",
              WebkitLineClamp:4,
              WebkitBoxOrient:"vertical",
            }}>{q.question}</p>
          </div>

          {/* ドーグちゃん + ヒント（高さ固定：18vh） */}
          <div style={{ height:"18vh", flexShrink:0, display:"flex", alignItems:"center", gap:"1.5vw", marginBottom:"1vh", overflow:"hidden" }}>
            <div style={{ flexShrink:0, height:"100%", display:"flex", alignItems:"center" }}>
              <Dogu mood={mood} size={Math.min(window?.innerHeight * 0.16 || 120, 140)} />
            </div>
            <div style={{
              flex:1, height:"100%",
              background:"rgba(200,169,110,0.15)", border:"2px solid #C8A96E",
              borderRadius:"20px 20px 20px 6px", padding:"1vh 2vw",
              overflow:"hidden", display:"flex", alignItems:"center",
            }}>
              <p style={{ margin:0, fontSize:"clamp(12px,1.6vw,26px)", color:"#FFE8A0", lineHeight:1.6, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>{doguMessage}</p>
            </div>
          </div>

          {/* 選択肢エリア（残り高さを使用） */}
          <div style={{ flex:1, minHeight:0, position:"relative" }}>
            {/* ざんねんオーバーレイ */}
            {judgeMark === "wrong" && (
              <div style={{
                position:"absolute", inset:0, zIndex:50,
                display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:16, pointerEvents:"none",
                animation:"judgeFade 10s ease forwards",
              }}>
                <div style={{
                  fontSize:"clamp(48px,10vw,140px)",
                  fontWeight:900,
                  color:"#8899AA",
                  textShadow:"0 0 40px #445566, 0 0 80px #334455",
                  animation:"judgePop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                  letterSpacing:"0.05em",
                }}>
                  ざんねん
                </div>
              </div>
            )}
            {/* 選択肢グリッド */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:"1vh 1.5vw", height:"100%" }}>
              {q.choices.map((c, i) => {
                let bg = `linear-gradient(135deg,${btnColors[i]},${btnColors[i]}CC)`;
                let border = "3px solid rgba(255,255,255,0.2)";
                let opacity = 1;
                if (selected !== null) {
                  if (i === q.answer) {
                    bg = "linear-gradient(135deg,#FFD700,#C8A96E)";
                    border = "4px solid #FFD700";
                  }
                  else if (i === selected && i !== q.answer) { bg = "linear-gradient(135deg,#8A1A1A,#600)"; border = "3px solid #FF6B6B"; }
                  else { opacity = 0.3; }
                }
                return (
                  <button key={i} onClick={() => selected===null && handleAnswer(i)}
                    style={{
                      background:bg, border, borderRadius:16,
                      color:"#FFF", cursor:selected===null?"pointer":"default",
                      fontFamily:"'Zen Maru Gothic', sans-serif",
                      boxShadow:"0 4px 14px rgba(0,0,0,0.4)", opacity, transition:"all 0.2s",
                      display:"flex", alignItems:"center", gap:"1.5vw",
                      padding:"1vh 2vw", overflow:"hidden",
                    }}>
                    <span style={{ fontSize:"clamp(22px,3vw,48px)", fontWeight:700, opacity:0.95, flexShrink:0, width:"clamp(32px,4vw,64px)", height:"clamp(32px,4vw,64px)", borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>{btnLabels[i]}</span>
                    <span style={{ fontSize:"clamp(13px,1.8vw,30px)", fontWeight:700, lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", textAlign:"left" }}>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 次の問題へボタン（高さ固定：8vh） */}
          {selected !== null && (
            <div style={{ height:"8vh", flexShrink:0, display:"flex", alignItems:"center", paddingTop:"0.5vh" }}>
              <button
                onClick={() => goNextQuestion(selected === q.answer)}
                style={{
                  flex:1, height:"100%",
                  background:"linear-gradient(135deg,#FFD700,#C8A96E)",
                  color:"#3B1F0A", border:"none", borderRadius:50,
                  fontSize:"clamp(14px,1.8vw,28px)", fontWeight:700,
                  cursor:"pointer", fontFamily:"'Zen Maru Gothic', sans-serif",
                  letterSpacing:"0.05em",
                }}
              >
                つぎの もんだいへ →
                {nextCountdown !== null && (
                  <span style={{ marginLeft:8, fontSize:"0.8em", opacity:0.7 }}>（{nextCountdown}びょう）</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* けっか画面 */}
      {phase === "result" && (
        <div style={{ position:"relative", zIndex:1, minHeight:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
          <Dogu mood={score===10?"excited":score>=7?"happy":score>=4?"idle":"wrong"} size={120} />
          {userPhoto && <img src={userPhoto} style={{ width:60, height:60, borderRadius:"50%", objectFit:"cover", border:"3px solid #FFD700", margin:"8px auto" }} alt="you" />}
          {userName && <p style={{ color:"#FFE8A0", fontSize:16, margin:"4px 0", fontFamily:"'Zen Maru Gothic', sans-serif" }}>{userName}</p>}
          {challengerNo && <p style={{ color:"#C8A96E", fontSize:12, margin:"2px 0 12px" }}>ちゃれんじゃ No.{challengerNo} ・ これまで {totalCount?.toLocaleString()}にんが ちゃれんじ！</p>}
          <div style={{ background:"linear-gradient(135deg,rgba(59,31,10,0.95),rgba(92,51,23,0.9))", border:"2px solid #FFD700", borderRadius:20, padding:"20px 32px", marginBottom:20, boxShadow:"0 0 30px rgba(255,215,0,0.3)" }}>
            <p style={{ color:"#C8A96E", fontSize:14, margin:"0 0 4px", fontFamily:"'Zen Maru Gothic', sans-serif" }}>せいかい すう</p>
            <p style={{ color:"#FFD700", fontSize:64, fontWeight:700, margin:0, fontFamily:"'Zen Maru Gothic', sans-serif", textShadow:"0 0 20px #FFD700" }}>
              {score}<span style={{ fontSize:24, color:"#C8A96E" }}>/{gameQuestions.length}</span>
            </p>
            <p style={{ color:"#FFE8A0", fontSize:15, margin:"8px 0 0", fontFamily:"'Zen Maru Gothic', sans-serif" }}>
              {score===10?"🏆 かんぺき！せいかいはぜんぶだよ！":score>=7?"🎉 すごい！れきしはかせにちかいよ！":score>=4?"💪 もうすこし！がんばろう！":"😅 いっしょに もっとまなぼうね！"}
            </p>
          </div>
          <a href={getCertUrl()} style={{ display:"block", width:"100%", maxWidth:300, marginBottom:12, padding:"14px 24px", background:"linear-gradient(135deg,#3B1F0A,#5C3317)", color:"#FFD700", border:"2px solid #FFD700", borderRadius:50, fontSize:15, fontWeight:700, textDecoration:"none", fontFamily:"'Zen Maru Gothic', sans-serif", letterSpacing:"0.05em", textAlign:"center", boxShadow:"0 0 20px rgba(255,215,0,0.3)", boxSizing:"border-box" }}>
            📜 受講証明書を見る
          </a>
          {score===10 && (
            <a href="/hall-of-fame" style={{ display:"block", width:"100%", maxWidth:300, marginBottom:12, padding:"10px 24px", background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", borderRadius:50, fontSize:14, fontWeight:700, textDecoration:"none", fontFamily:"'Zen Maru Gothic', sans-serif", textAlign:"center", boxSizing:"border-box" }}>
              🏛 でんどうをみる
            </a>
          )}
          <button onClick={() => { reset(); setTimeout(() => setPhase("warp"),100); setTimeout(()=>setPhase("register"),2900); }} style={{ width:"100%", maxWidth:300, padding:"14px", background:"linear-gradient(135deg,#FFD700,#C8A96E)", color:"#3B1F0A", border:"none", borderRadius:50, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Zen Maru Gothic', sans-serif", marginBottom:10 }}>
            もう いちど ちゃれんじ！
          </button>
          <button onClick={reset} style={{ color:"#C8A96E", background:"transparent", border:"1.5px solid #C8A96E", borderRadius:50, padding:"10px 24px", fontSize:13, cursor:"pointer" }}>
            タイトルに もどる
          </button>
        </div>
      )}
    </div>
  );
}
