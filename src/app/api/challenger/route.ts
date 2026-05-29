import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
};

export async function POST(req: NextRequest) {
  try {
    const redis = getRedis();
    const body = await req.json();
    const { name, score, photo } = body;

    if (!redis) {
      return NextResponse.json({ no: "0001", count: 1, offline: true });
    }

    const count: number = await redis.incr("challenger:count");
    const no = String(count).padStart(4, "0");
    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    if (score === 10) {
      const entry = JSON.stringify({
        no, name: name || "匿名の挑戦者", score, photo: photo || null, date: now,
      });
      await redis.lpush("challenger:hall_of_fame", entry);
    }

    return NextResponse.json({ no, count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ no: "----", count: 0, error: true });
  }
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ count: 0, hallOfFame: [] });

    const count = (await redis.get<number>("challenger:count")) || 0;
    const raw = await redis.lrange<string>("challenger:hall_of_fame", 0, 99);
    const hallOfFame = raw.map(item => typeof item === "string" ? JSON.parse(item) : item);
    return NextResponse.json({ count, hallOfFame });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ count: 0, hallOfFame: [] });
  }
}
