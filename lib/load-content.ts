import { cookies } from "next/headers";
import type { ContentItem, ContentType } from "./church-content";
import { createClient } from "../utils/supabase/server";

export async function loadPublishedContent(
  contentType: ContentType,
  limit = 1,
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    let query = supabase
      .from("content_items")
      .select("*")
      .eq("content_type", contentType)
      .eq("status", "published")
      .order(contentType === "daily_word" ? "content_date" : "published_at", {
        ascending: false,
        nullsFirst: false,
      });

    if (contentType === "daily_word") {
      query = query.order("published_at", {
        ascending: false,
        nullsFirst: false,
      });
    }

    const { data, error } = await query.limit(limit);

    if (error || !data) return [];
    return data as ContentItem[];
  } catch {
    return [];
  }
}

export async function loadPublishedWords(limit = 1000) {
  const items = await loadPublishedContent("daily_word", limit);
  const seenDates = new Set<string>();

  return items.filter((item) => {
    if (seenDates.has(item.content_date)) return false;
    seenDates.add(item.content_date);
    return true;
  });
}
