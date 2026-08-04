import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export type SupabaseBrowserConfig = {
  url?: string;
  publishableKey?: string;
};

export const createClient = (config: SupabaseBrowserConfig = {}) => {
  const url = config.url || supabaseUrl;
  const publishableKey = config.publishableKey || supabaseKey;

  if (!url || !publishableKey) {
    throw new Error("Supabase 연결 정보가 설정되지 않았습니다.");
  }

  return createBrowserClient(url, publishableKey);
};
