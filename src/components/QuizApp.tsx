"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import DoguFace from "./DoguFace";
import ChatBubble from "./ChatBubble";
import ChoiceButtons from "./ChoiceButtons";
import { DoguMood, Message } from "@/lib/types";
import { questions } from "@/lib/questions";

type Phase = "title" | "quiz" | "result";

export default function QuizApp() {
  const [phase, setPhase] = useState<Phase>("title");
  const [messages, setMessages] = useState<Message[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [doguMood, setDoguMood] = useState<DoguMood>("idle");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = useCallback((role: "dogu" | "user", content: string, mood: DoguMood = "idle") => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content, mood }]);
  }, []);

  const typeMessage = useCallback(async (content: string, mood: DoguMood = "idle", delay = 800) => {
    setIsTyping(true);
    setDoguMood("think");
    await new Promise(r => setTimeout(r, delay));
    setIsTyping(false);
    setDoguMood(mood);
    addMessage("dogu", content, mood);
  }, [addMessage]);

  const startQuiz = useCallback(async () => {
    setMessages([]);
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setPhase("quiz");
    await typeMessage(
      `ぬぅ…目覚めたぞ。わしは砺波の土偶じゃ🏺\n\n砺波正倉の古文書を読み解き、謎解きクイズ全10問を用意した。\n\n流送・交易・寺子屋・古代の砺波…\n砺波の歴史の深さを思い知るがよい！`,
      "excited", 1200
    );
    await typeMessage(
      questions[0].question + "\n\nヒント：" + questions[0].hint,
      "think", 1000
    );
  }, [typeMessage]);

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
        const finalScore = isCorrect ? score + 1 : score;
        const msg =
          finalScore === 10 ? `満点じゃ！！🎉 砺波の歴史を完全に会得したな！わしも誇らしいぞ！` :
          finalScore >= 7  ? `${finalScore}問正解！素晴らしい洞察力じゃ！砺波の歴史はお主の心に刻まれた！` :
          finalScore >= 4  ? `${finalScore}問正解じゃ。まだまだ修行が必要じゃが、素質はある！` :
                             `${finalScore}問正解…古文書の深みは計り知れぬ。またわしと学ぼうぞ。`;
        await typeMessage(msg, "happy", 600);
        setPhase("result");
      } else {
        setQIndex(next);
        setSelected(null);
        await typeMessage(questions[next].question + "\n\nヒント：" + questions[next].hint, "think", 600);
      }
    }, 3200);
  }, [selected, phase, qIndex, score, addMessage, typeMessage]);

  const currentQ = questions[qIndex];
  const finalScore = score;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#1A0E05" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600&family=Noto+Sans+JP:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#1A0E05}
        ::-webkit-scrollbar-thumb{background:#5C3D1E;border-radius:2px}
      `}</style>

      {/* ヘッダー */}
      <div style={{ background:"#2C1A0E", borderBottom:"0.5px solid #5C3D1E", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <DoguFace mood={doguMood} size={40} />
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#F5EFE0", fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.1em" }}>
            砺波の土偶 謎解きクイズ
          </p>
          <p style={{ margin:0, fontSize:11, color:"#9A7A5A" }}>
            {phase === "title" ? "砺波正倉の古文書から出題" :
             phase === "quiz"  ? `第${qIndex+1}問 / 全${questions.length}問` : "全問終了"}
          </p>
        </div>
        {(phase === "quiz" || phase === "result") && (
          <button onClick={() => { setPhase("title"); setMessages([]); setScore(0); setQIndex(0); setSelected(null); setDoguMood("idle"); }}
            style={{ padding:"6px 14px", background:"transparent", border:"0.5px solid #5C3D1E", borderRadius:6, color:"#9A7A5A", fontSize:12, cursor:"pointer" }}>
            最初から
          </button>
        )}
      </div>

      {/* スコアバー */}
      {(phase === "quiz" || phase === "result") && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 16px", background:"#2C1A0E", borderBottom:"0.5px solid #5C3D1E", flexShrink:0 }}>
          <span style={{ fontSize:12, color:"#C8B89A", fontFamily:"'Noto Sans JP', sans-serif" }}>
            問 {Math.min(qIndex + (selected !== null ? 1 : 0), questions.length)} / {questions.length}
          </span>
          <div style={{ flex:1, height:4, background:"#5C3D1E", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", background:"#C8B89A", borderRadius:2, transition:"width 0.4s ease",
              width:`${(Math.min(qIndex+(selected!==null?1:0),questions.length)/questions.length)*100}%` }} />
          </div>
          <span style={{ fontSize:12, color:"#C8B89A", fontFamily:"'Noto Sans JP', sans-serif" }}>正解 {score}問</span>
        </div>
      )}

      {/* タイトル画面 */}
      {phase === "title" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
          <DoguFace mood="idle" size={100} />
          <p style={{ color:"#C8B89A", fontSize:18, margin:"20px 0 8px", fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.15em", textAlign:"center" }}>
            砺波正倉<br/>謎解きクイズ
          </p>
          <p style={{ color:"#7A5A3A", fontSize:13, margin:"0 0 32px", fontFamily:"'Noto Sans JP', sans-serif", textAlign:"center", lineHeight:1.8 }}>
            砺波の流送・交易・寺子屋・古代史…<br/>全10問の謎に挑め！
          </p>
          <button onClick={startQuiz} style={{
            padding:"14px 40px", background:"#7B6A4E", color:"#F5EFE0",
            border:"none", borderRadius:10, fontSize:16,
            fontFamily:"'Noto Serif JP', serif", letterSpacing:"0.1em", cursor:"pointer"
          }}>
            謎解きを始める 🏺
          </button>
        </div>
      )}

      {/* チャット画面 */}
      {(phase === "quiz" || phase === "result") && (
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} mood={msg.mood} />
          ))}
          {isTyping && <ChatBubble role="dogu" mood="think" isTyping />}

          {phase === "quiz" && !isTyping && currentQ && (
            <ChoiceButtons choices={currentQ.choices} onSelect={handleAnswer} selected={selected} correct={currentQ.answer} />
          )}

          {/* 結果サマリー */}
          {phase === "result" && !isTyping && (
            <div style={{ margin:"24px 0", padding:"24px", background:"#2C1A0E", borderRadius:12, border:"0.5px solid #5C3D1E", textAlign:"center", animation:"fadeUp 0.4s ease" }}>
              <DoguFace mood={finalScore>=7?"happy":finalScore>=4?"idle":"wrong"} size={72} />
              <p style={{ fontSize:48, fontWeight:700, color:"#C8B89A", margin:"12px 0 4px", fontFamily:"'Noto Serif JP', serif" }}>
                {finalScore} <span style={{ fontSize:20, color:"#7A5A3A" }}>/ 10</span>
              </p>
              <p style={{ color:"#9A7A5A", fontSize:13, margin:"0 0 20px", fontFamily:"'Noto Sans JP', sans-serif" }}>
                {finalScore===10?"完全制覇！砺波の歴史を全て会得した！":
                 finalScore>=7?"優秀な探求者よ！":
                 finalScore>=4?"まだまだ修行じゃ":"古文書をもっと読むがよい"}
              </p>
              <button onClick={startQuiz} style={{
                padding:"10px 24px", background:"#7B6A4E", color:"#F5EFE0",
                border:"none", borderRadius:8, fontSize:14, cursor:"pointer",
                fontFamily:"'Noto Serif JP', serif"
              }}>もう一度挑む</button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
