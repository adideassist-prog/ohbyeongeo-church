"use client";

import {
  mergePublishedWords,
  type ContentItem,
  type ContentType,
} from "./church-content";
import { createClient } from "../utils/supabase/client";

export async function loadClientPublishedContent(
  contentType: ContentType,
  limit = 1,
) {
  try {
    const supabase = createClient();
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

export async function loadClientPublishedWords(limit = 1000) {
  const items = await loadClientPublishedContent("daily_word", limit);
  const seenDates = new Set<string>();

  const uniqueItems = items.filter((item) => {
    if (seenDates.has(item.content_date)) return false;
    seenDates.add(item.content_date);
    return true;
  });

  return mergePublishedWords(uniqueItems);
}
