"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import DoguFace from "./DoguFace";
import ChatBubble from "./ChatBubble";
import ChoiceButtons from "./ChoiceButtons";
import { DoguMood, Message } from "@/lib/types";
import { questions } from "@/lib/questions";

type Phase = "title" | "register" | "camera" | "quiz" | "result";

export default function QuizApp() {
  const [phase, setPhase] = useState<Phase>("title");
  const [messages, setMessages] = useState<Message[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [doguMood, setDoguMood] = useState<DoguMood>("idle");
  const [isTyping, setIsTyping] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [challengerNo, setChallengerNo] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setIsCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => { videoRef.current?.play(); setIsCameraReady(true); };
      }
    } catch {
      setCameraError("カメラへのアクセスが許可されていません。");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    if (phase === "camera") startCamera();
    else stopCamera();
  }, [phase, startCamera, stopCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save(); ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setUserPhoto(dataUrl);
    stopCamera();
    beginQuiz(dataUrl);
  }, [stopCamera]);

  const addMessage = useCallback((role: "dogu" | "user", content: string, mood: DoguMood = "idle") => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content, mood }]);
  }, []);

  const typeMessage = useCallback(async (content: string, mood: DoguMood = "idle", delay = 800) => {
    setIsTyping(true); setDoguMood("think");
    await new Promise(r => setTimeout(r, delay));
    setIsTyping(false); setDoguMood(mood);
    addMessage("dogu", content, mood);
  }, [addMessage]);

  const beginQuiz = useCallback(async (photo?: string | null) => {
    setMessages([]); setQIndex(0); setScore(0); setSelected(null);
    if (photo !== undefined) setUserPhoto(photo);
    setPhase("quiz");
    const name = userName.trim() || "匿名の挑戦者";
    await typeMessage(
      `ぬぅ…目覚めたぞ。わしは砺波の土偶じゃ🏺\n\n${name}よ、よく来た！\n砺波正倉の古文書から謎解きクイズ全10問じゃ。\n\n流送・交易・寺子屋・古代の砺波…\n砺波の歴史の深さを思い知るがよい！`,
      "excited", 1200
    );
    await typeMessage(questions[0].question + "\n\nヒント：" + questions[0].hint, "think", 1000);
  }, [typeMessage, userName]);

  const registerChallenger = useCallback(async (finalScore: number, photo: string | null) => {
    try {
      const res = await fetch("/api/challenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName.trim() || "匿名の挑戦者", score: finalScore, photo }),
      });
      const data = await res.json();
      if (data.no) { setChallengerNo(data.no); setTotalCount(data.count); }
    } catch { /* オフライン時はスキップ */ }
  }, [userName]);

  const handleAnswer = useCallback(async (idx: number) => {
    if (selected !== null || phase !== "quiz") return;
    setSelected(idx);
    const q = questions[qIndex];
    const isCorrect = idx === q.answer;
    if (isCorrect) setScore(s => s + 1);
    addMessage("user", `「${"ＡＢＣＤ"[idx]}：${q.choices[idx]}」を選択`);
    if (isCorrect) {
      await typeMessage(`正解じゃ！⭐\n\n${q.explanation}\n\n次の謎へ進もうぞ…`, "correct", 900);
    } else {
      await typeMessage(`惜しい…正解は「${q.choices[q.answer]}」じゃ。\n\n${q.explanation}\n\n次の謎へ進もうぞ…`, "wrong", 900);
    }
    setTimeout(async () => {
      const next = qIndex + 1;
      if (next >= questions.length) {
        const fs = isCorrect ? score + 1 : score;
        await registerChallenger(fs, userPhoto);
        const msg =
          fs === 10 ? `満点じゃ！！🎉 砺波の歴史を完全に会得したな！殿堂入りおめでとう！` :
          fs >= 7   ? `${fs}問正解！素晴らしい洞察力じゃ！` :
          fs >= 4   ? `${fs}問正解じゃ。まだまだ修行が必要じゃが、素質はある！` :
                      `${fs}問正解…古文書の深みは計り知れぬ。またわしと学ぼうぞ。`;
        await typeMessage(msg, "happy", 600);
        setPhase("result");
      } else {
        setQIndex(next); setSelected(null);
        await typeMessage(questions[next].question + "\n\nヒント：" + questions[next].hint, "think", 600);
      }
    }, 3200);
  }, [selected, phase, qIndex, score, addMessage, typeMessage, registerChallenger, userPhoto]);

  const reset = () => {
    setPhase("title"); setMessages([]); setScore(0); setQIndex(0);
    setSelected(null); setDoguMood("idle"); setUserPhoto(null);
    setUserName(""); setChallengerNo(null); setTotalCount(null); setCameraError("");
  };

  const currentQ = questions[qIndex];
  const finalScore = score;

  return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:"#1A0E05" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600&family=Noto+Sans+JP:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input::placeholder{color:#5C3D1E}
        input:focus{outline:none;border-color:#C8B89A !important}
      `}</style>

      {/* ヘッダー */}
      <div style={{ background:"#2C1A0E", borderBottom:"0.5px solid #5C3D1E", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <DoguFace mood={doguMood} size={40} />
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#F5EFE0", fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.1em" }}>砺波の土偶 謎解きクイズ</p>
          <p style={{ margin:0, fontSize:11, color:"#9A7A5A" }}>
            {phase==="title"?"砺波正倉の古文書から出題":
             phase==="register"?"挑戦者登録":
             phase==="camera"?"写真撮影":
             phase==="quiz"?`第${qIndex+1}問 / 全${questions.length}問`:"全問終了"}
          </p>
        </div>
        {(phase==="quiz"||phase==="result") && (
          <button onClick={reset} style={{ padding:"6px 14px", background:"transparent", border:"0.5px solid #5C3D1E", borderRadius:6, color:"#9A7A5A", fontSize:12, cursor:"pointer" }}>最初から</button>
        )}
        <a href="/hall-of-fame" style={{ padding:"6px 14px", background:"transparent", border:"0.5px solid #5C3D1E", borderRadius:6, color:"#9A7A5A", fontSize:12, textDecoration:"none" }}>🏆殿堂</a>
      </div>

      {/* スコアバー */}
      {(phase==="quiz"||phase==="result") && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 16px", background:"#2C1A0E", borderBottom:"0.5px solid #5C3D1E", flexShrink:0 }}>
          <span style={{ fontSize:12, color:"#C8B89A", fontFamily:"'Noto Sans JP', sans-serif" }}>問 {Math.min(qIndex+(selected!==null?1:0),questions.length)} / {questions.length}</span>
          <div style={{ flex:1, height:4, background:"#5C3D1E", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"#C8B89A", borderRadius:2, transition:"width 0.4s ease", width:`${(Math.min(qIndex+(selected!==null?1:0),questions.length)/questions.length)*100}%` }} />
          </div>
          <span style={{ fontSize:12, color:"#C8B89A", fontFamily:"'Noto Sans JP', sans-serif" }}>正解 {score}問</span>
        </div>
      )}

      {/* タイトル画面 */}
      {phase==="title" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
          <DoguFace mood="idle" size={100} />
          <p style={{ color:"#C8B89A", fontSize:18, margin:"20px 0 8px", fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.15em", textAlign:"center" }}>砺波正倉<br/>謎解きクイズ</p>
          <p style={{ color:"#7A5A3A", fontSize:13, margin:"0 0 32px", fontFamily:"'Noto Sans JP', sans-serif", textAlign:"center", lineHeight:1.8 }}>
            砺波の流送・交易・寺子屋・古代史…<br/>全10問の謎に挑め！
          </p>
          <button onClick={() => setPhase("register")} style={{ width:240, padding:"14px", background:"#7B6A4E", color:"#F5EFE0", border:"none", borderRadius:10, fontSize:15, fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.1em", cursor:"pointer", marginBottom:12 }}>
            挑戦を始める 🏺
          </button>
          <a href="/hall-of-fame" style={{ fontSize:13, color:"#7A5A3A", fontFamily:"'Noto Sans JP', sans-serif" }}>🏆 満点殿堂を見る</a>
        </div>
      )}

      {/* 登録画面 */}
      {phase==="register" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ width:"100%", maxWidth:380 }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <DoguFace mood="excited" size={72} />
              <p style={{ color:"#C8B89A", fontSize:15, margin:"12px 0 4px", fontFamily:"'Noto Serif JP', serif" }}>挑戦者よ、名を名乗れ！</p>
              <p style={{ color:"#7A5A3A", fontSize:12, margin:0, fontFamily:"'Noto Sans JP', sans-serif" }}>（入力しなくても進めます）</p>
            </div>
            <input
              ref={nameInputRef}
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setPhase("camera")}
              placeholder="お名前を入力（任意）"
              maxLength={20}
              style={{
                width:"100%", padding:"14px 16px", background:"#2C1A0E",
                border:"0.5px solid #5C3D1E", borderRadius:8, color:"#F5EFE0",
                fontSize:15, fontFamily:"'Noto Sans JP', sans-serif",
                boxSizing:"border-box", marginBottom:16,
              }}
            />
            <button onClick={() => setPhase("camera")} style={{ width:"100%", padding:"14px", background:"#7B6A4E", color:"#F5EFE0", border:"none", borderRadius:10, fontSize:15, fontFamily:"'Noto Serif JP', serif", cursor:"pointer", marginBottom:10 }}>
              次へ（写真を撮る）→
            </button>
            <button onClick={() => beginQuiz(null)} style={{ width:"100%", padding:"12px", background:"transparent", color:"#7A5A3A", border:"0.5px solid #5C3D1E", borderRadius:10, fontSize:13, fontFamily:"'Noto Sans JP', sans-serif", cursor:"pointer" }}>
              写真なしで始める
            </button>
          </div>
        </div>
      )}

      {/* カメラ画面 */}
      {phase==="camera" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, gap:16 }}>
          <p style={{ color:"#C8B89A", fontSize:14, margin:0, fontFamily:"'Noto Serif JP', serif" }}>顔を中央に合わせて撮影じゃ🏺</p>
          <div style={{ position:"relative", width:"100%", maxWidth:360, borderRadius:12, overflow:"hidden", background:"#2C1A0E", border:"0.5px solid #5C3D1E", aspectRatio:"4/3" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:isCameraReady?"block":"none" }} />
            {!isCameraReady && !cameraError && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <p style={{ color:"#7A5A3A", fontSize:13 }}>カメラ起動中…</p>
              </div>
            )}
            {cameraError && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
                <p style={{ color:"#F09595", fontSize:12, textAlign:"center" }}>{cameraError}</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display:"none" }} />
          <div style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:360 }}>
            {isCameraReady && (
              <button onClick={takePhoto} style={{ padding:"14px", background:"#7B6A4E", color:"#F5EFE0", border:"none", borderRadius:10, fontSize:15, fontFamily:"'Noto Serif JP', serif", cursor:"pointer" }}>
                📸 撮影する
              </button>
            )}
            <button onClick={() => beginQuiz(null)} style={{ padding:"12px", background:"transparent", color:"#7A5A3A", border:"0.5px solid #5C3D1E", borderRadius:10, fontSize:13, fontFamily:"'Noto Sans JP', sans-serif", cursor:"pointer" }}>
              スキップして始める
            </button>
          </div>
        </div>
      )}

      {/* チャット画面 */}
      {(phase==="quiz"||phase==="result") && (
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} mood={msg.mood} userPhoto={userPhoto} />
          ))}
          {isTyping && <ChatBubble role="dogu" mood="think" isTyping userPhoto={userPhoto} />}
          {phase==="quiz" && !isTyping && currentQ && (
            <ChoiceButtons choices={currentQ.choices} onSelect={handleAnswer} selected={selected} correct={currentQ.answer} />
          )}

          {/* 結果 */}
          {phase==="result" && !isTyping && (
            <div style={{ margin:"24px 0", padding:"24px", background:"#2C1A0E", borderRadius:12, border:"0.5px solid #5C3D1E", textAlign:"center", animation:"fadeUp 0.4s ease" }}>
              {userPhoto ? (
                <img src={userPhoto} style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"2px solid #7B6A4E", marginBottom:8 }} alt="プレイヤー" />
              ) : (
                <DoguFace mood={finalScore>=7?"happy":finalScore>=4?"idle":"wrong"} size={80} />
              )}
              {userName && <p style={{ color:"#C8B89A", fontSize:14, margin:"8px 0 0", fontFamily:"'Noto Serif JP', serif" }}>{userName}</p>}
              {challengerNo && (
                <p style={{ color:"#7A5A3A", fontSize:12, margin:"4px 0 0", fontFamily:"'Noto Sans JP', sans-serif" }}>
                  挑戦者 No.{challengerNo}
                  {totalCount && ` ／ 累計 ${totalCount.toLocaleString()}人が挑戦`}
                </p>
              )}
              <p style={{ fontSize:52, fontWeight:700, color:"#C8B89A", margin:"12px 0 4px", fontFamily:"'Noto Serif JP', serif" }}>
                {finalScore} <span style={{ fontSize:20, color:"#7A5A3A" }}>/ 10</span>
              </p>
              <p style={{ color:"#9A7A5A", fontSize:13, margin:"0 0 8px", fontFamily:"'Noto Sans JP', sans-serif" }}>
                {finalScore===10?"🏆 完全制覇！殿堂入りおめでとう！":
                 finalScore>=7?"優秀な探求者よ！":
                 finalScore>=4?"まだまだ修行じゃ":"古文書をもっと読むがよい"}
              </p>
              {finalScore===10 && (
                <a href="/hall-of-fame" style={{ display:"inline-block", marginBottom:16, padding:"8px 20px", background:"#C8B89A", color:"#1A0E05", borderRadius:6, fontSize:13, fontFamily:"'Noto Serif JP', serif", textDecoration:"none", fontWeight:600 }}>
                  🏆 殿堂を見る
                </a>
              )}
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                <button onClick={() => { setPhase("register"); setScore(0); setQIndex(0); setSelected(null); setMessages([]); setChallengerNo(null); }} style={{ padding:"10px 20px", background:"#7B6A4E", color:"#F5EFE0", border:"none", borderRadius:8, fontSize:14, cursor:"pointer", fontFamily:"'Noto Serif JP', serif" }}>
                  もう一度挑む
                </button>
                <button onClick={reset} style={{ padding:"10px 20px", background:"transparent", color:"#9A7A5A", border:"0.5px solid #5C3D1E", borderRadius:8, fontSize:14, cursor:"pointer", fontFamily:"'Noto Sans JP', sans-serif" }}>
                  タイトルへ
                </button>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
