import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  CommentLimitError,
  createComment,
  deleteComment,
  DuplicateCommentError,
  listAllComments,
  listPublicComments,
  setCommentStatus,
  type CommentStatus,
} from "../../../db/comments";
import { createClient as createServerClient } from "../../../utils/supabase/server";

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
    headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  return headers;
}

function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request),
  });
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\r\n/g, "\n") : "";
}

function isValidWordKey(value: string) {
  return value.length >= 4 && value.length <= 80 && /^[a-zA-Z0-9._:-]+$/.test(value);
}

function isValidId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/.test(value);
}

async function hashValue(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function getModerationKey(request: Request, deviceId: string) {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const userAgent = request.headers.get("user-agent")?.slice(0, 160) ?? "unknown";
  return hashValue(`ohbyeongeo-comments-v1|${ip}|${userAgent}|${deviceId}`);
}

async function isAdminRequest(request: Request) {
  try {
    const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return false;

      const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: userData, error: userError } = await supabase.auth.getUser(bearer);
      if (userError || !userData.user) return false;
      const { data, error } = await supabase.rpc("is_admin");
      return !error && Boolean(data);
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data, error } = await supabase.rpc("is_admin");
    return !error && Boolean(data);
  } catch {
    return false;
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: responseHeaders(request) });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("scope") === "admin") {
      if (!(await isAdminRequest(request))) {
        return json(request, { error: "관리자 권한이 필요합니다." }, 403);
      }
      return json(request, { comments: await listAllComments() });
    }

    const wordKey = cleanText(url.searchParams.get("wordKey"));
    if (!isValidWordKey(wordKey)) {
      return json(request, { error: "말씀 날짜 정보가 필요합니다." }, 400);
    }

    return json(request, { comments: await listPublicComments(wordKey) });
  } catch {
    return json(request, { error: "댓글을 불러오지 못했습니다." }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const wordKey = cleanText(payload.wordKey);
    const wordLabel = cleanText(payload.wordLabel);
    const authorName = cleanText(payload.authorName);
    const body = cleanText(payload.body);
    const deviceId = cleanText(payload.deviceId);
    const website = cleanText(payload.website);

    if (website) return json(request, { ok: true });
    if (!isValidWordKey(wordKey) || wordLabel.length < 2 || wordLabel.length > 100) {
      return json(request, { error: "오늘의 말씀 정보를 확인해 주세요." }, 400);
    }
    if (authorName.length < 1 || authorName.length > 20) {
      return json(request, { error: "이름은 1자 이상 20자 이하로 적어 주세요." }, 400);
    }
    if (body.length < 2 || body.length > 500) {
      return json(request, { error: "댓글은 2자 이상 500자 이하로 적어 주세요." }, 400);
    }
    if (deviceId.length < 20 || deviceId.length > 80 || !/^[a-zA-Z0-9-]+$/.test(deviceId)) {
      return json(request, { error: "댓글을 등록할 수 없습니다. 페이지를 새로고침해 주세요." }, 400);
    }

    const comment = await createComment({
      wordKey,
      wordLabel,
      authorName,
      body,
      moderationKey: await getModerationKey(request, deviceId),
    });
    return json(request, { comment }, 201);
  } catch (error) {
    if (error instanceof CommentLimitError || error instanceof DuplicateCommentError) {
      return json(request, { error: error.message }, 429);
    }
    return json(request, { error: "댓글을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 500);
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) {
    return json(request, { error: "관리자 권한이 필요합니다." }, 403);
  }

  try {
    const payload = (await request.json()) as { id?: unknown; status?: unknown };
    if (!isValidId(payload.id) || !["visible", "hidden"].includes(String(payload.status))) {
      return json(request, { error: "올바른 댓글 정보가 필요합니다." }, 400);
    }

    const changed = await setCommentStatus(payload.id, payload.status as CommentStatus);
    return json(request, { changed });
  } catch {
    return json(request, { error: "댓글 상태를 변경하지 못했습니다." }, 500);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) {
    return json(request, { error: "관리자 권한이 필요합니다." }, 403);
  }

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!isValidId(id)) {
      return json(request, { error: "올바른 댓글 정보가 필요합니다." }, 400);
    }
    return json(request, { deleted: await deleteComment(id) });
  } catch {
    return json(request, { error: "댓글을 삭제하지 못했습니다." }, 500);
  }
}
