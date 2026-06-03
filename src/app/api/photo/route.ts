import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// 写真を保存（POST）
export async function POST(req: NextRequest) {
  try {
    const { photo } = await req.json();
    if (!photo) return NextResponse.json({ error: "no photo" }, { status: 400 });

    // ランダムなIDを生成
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);

    // Redisに保存（30分 = 1800秒で自動削除）
    await redis.set(`photo:${id}`, photo, { ex: 180 });

    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

// 写真を取得（GET）
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "no id" }, { status: 400 });

    const photo = await redis.get(`photo:${id}`);
    if (!photo) return NextResponse.json({ error: "not found" }, { status: 404 });

    return NextResponse.json({ photo });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
