import {
  bulletinFromItem,
  newsFromItem,
  wordFromItem,
} from "../lib/church-content";
import { loadPublishedContent } from "../lib/load-content";
import HomePageView from "./HomePageView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [[bulletinItem], [wordItem], [newsItem]] = await Promise.all([
    loadPublishedContent("bulletin"),
    loadPublishedContent("daily_word"),
    loadPublishedContent("news"),
  ]);

  return (
    <HomePageView
      bulletin={bulletinFromItem(bulletinItem)}
      word={wordFromItem(wordItem)}
      news={newsFromItem(newsItem)}
    />
  );
}
