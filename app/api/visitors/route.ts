import {
  getDailyVisitorCount,
  getKoreaDate,
  getTotalVisitorCount,
  recordDailyVisitor,
} from "../../../db/visitors";

const allowedOrigins = new Set([
  "https://adideassist-prog.github.io",
  "https://ohbyeongeo-church.modoomoa365.chatgpt.site",
  "http://terminal.local:4173",
]);

function responseHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  });

  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return headers;
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request),
  });
}

function isValidVisitorId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 80 &&
    /^[a-zA-Z0-9-]+$/.test(value)
  );
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: responseHeaders(request) });
}

export async function GET(request: Request) {
  try {
    const day = getKoreaDate();
    const [todayCount, totalCount] = await Promise.all([
      getDailyVisitorCount(day),
      getTotalVisitorCount(),
    ]);
    return json(request, { day, count: todayCount, todayCount, totalCount });
  } catch {
    return json(request, { error: "방문자 수를 불러오지 못했습니다." }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { visitorId?: unknown };

    if (!isValidVisitorId(payload.visitorId)) {
      return json(request, { error: "올바른 방문자 정보가 필요합니다." }, 400);
    }

    const day = getKoreaDate();
    const result = await recordDailyVisitor(day, payload.visitorId);
    return json(request, { day, ...result });
  } catch {
    return json(request, { error: "방문자 수를 기록하지 못했습니다." }, 500);
  }
}
