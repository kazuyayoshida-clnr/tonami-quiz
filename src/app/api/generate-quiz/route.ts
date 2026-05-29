import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 400 });
    }

    // ランダムに最大5件選択
    const shuffled = [...files].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(5, shuffled.length));

    // base64変換
    const b64Files = await Promise.all(
      picked.map(async (f) => {
        const buf = await f.arrayBuffer();
        const b64 = Buffer.from(buf).toString("base64");
        return { name: f.name, data: b64 };
      })
    );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              ...b64Files.map((f) => ({
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: f.data,
                },
              })),
              {
                type: "text",
                text: `あなたは砺波市の歴史・文化の専門家です。上記のPDF資料をもとに、謎解き風の4択クイズを10問作成してください。

ルール：
- 資料の内容に忠実な問題のみ
- 謎解きらしい、ひっかけや意外性のある問題文にする
- 難易度は易〜難をバランスよく混ぜる
- 解説は資料の具体的な記述に基づく

必ず以下のJSON形式のみで返してください（前後に説明文は不要）：
\`\`\`json
[
  {
    "question": "謎めいた問題文",
    "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    "answer": 0,
    "explanation": "正解の根拠と補足説明（2〜3文）",
    "hint": "ヒントになる一言（土偶が囁く感じで）"
  }
]
\`\`\`
answerは正解の選択肢インデックス（0〜3）。必ず10問。`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `API Error: ${res.status} ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data.content?.find((b: { type: string }) => b.type === "text")?.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\])/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "クイズの解析に失敗しました" }, { status: 500 });
    }

    const questions = JSON.parse(jsonMatch[1]);
    return NextResponse.json({
      questions,
      usedFiles: picked.map((f) => f.name),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
