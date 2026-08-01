import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dailyVisitors = sqliteTable(
  "daily_visitors",
  {
    day: text("day").notNull(),
    visitorId: text("visitor_id").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.day, table.visitorId] })],
);

export const wordComments = sqliteTable(
  "word_comments",
  {
    id: text("id").primaryKey(),
    wordKey: text("word_key").notNull(),
    wordLabel: text("word_label").notNull(),
    authorName: text("author_name").notNull(),
    body: text("body").notNull(),
    status: text("status", { enum: ["visible", "hidden"] })
      .notNull()
      .default("visible"),
    moderationKey: text("moderation_key").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("word_comments_word_status_created_idx").on(
      table.wordKey,
      table.status,
      table.createdAt,
    ),
    index("word_comments_moderation_created_idx").on(
      table.moderationKey,
      table.createdAt,
    ),
  ],
);
