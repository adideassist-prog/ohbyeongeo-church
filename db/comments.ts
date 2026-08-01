export type CommentStatus = "visible" | "hidden";

export type WordComment = {
  id: string;
  word_key: string;
  word_label: string;
  author_name: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
};

const createCommentsTableSql = `
  CREATE TABLE IF NOT EXISTS word_comments (
    id TEXT PRIMARY KEY,
    word_key TEXT NOT NULL,
    word_label TEXT NOT NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
    moderation_key TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

const createWordIndexSql = `
  CREATE INDEX IF NOT EXISTS word_comments_word_status_created_idx
  ON word_comments (word_key, status, created_at DESC)
`;

const createModerationIndexSql = `
  CREATE INDEX IF NOT EXISTS word_comments_moderation_created_idx
  ON word_comments (moderation_key, created_at DESC)
`;

let initialization: Promise<void> | null = null;
let commentDatabase: D1Database | null = null;

export function setCommentDatabase(database: D1Database | undefined) {
  commentDatabase = database ?? null;
}

function getDatabase() {
  if (!commentDatabase) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  return commentDatabase;
}

async function ensureCommentsTable() {
  if (!initialization) {
    const database = getDatabase();
    initialization = database
      .batch([
        database.prepare(createCommentsTableSql),
        database.prepare(createWordIndexSql),
        database.prepare(createModerationIndexSql),
      ])
      .then(() => undefined)
      .catch((error: unknown) => {
        initialization = null;
        throw error;
      });
  }

  await initialization;
}

export class CommentLimitError extends Error {}
export class DuplicateCommentError extends Error {}

export async function listPublicComments(wordKey: string) {
  await ensureCommentsTable();
  const result = await getDatabase()
    .prepare(
      `SELECT id, word_key, word_label, author_name, body, status, created_at, updated_at
       FROM word_comments
       WHERE word_key = ? AND status = 'visible'
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .bind(wordKey)
    .all<WordComment>();

  return result.results ?? [];
}

export async function listAllComments() {
  await ensureCommentsTable();
  const result = await getDatabase()
    .prepare(
      `SELECT id, word_key, word_label, author_name, body, status, created_at, updated_at
       FROM word_comments
       ORDER BY created_at DESC
       LIMIT 300`,
    )
    .all<WordComment>();

  return result.results ?? [];
}

export async function createComment(input: {
  wordKey: string;
  wordLabel: string;
  authorName: string;
  body: string;
  moderationKey: string;
}) {
  await ensureCommentsTable();
  const database = getDatabase();
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const recent = await database
    .prepare(
      "SELECT COUNT(*) AS count FROM word_comments WHERE moderation_key = ? AND created_at >= ?",
    )
    .bind(input.moderationKey, tenMinutesAgo)
    .first<{ count: number }>();

  if (Number(recent?.count ?? 0) >= 3) {
    throw new CommentLimitError("잠시 후 다시 댓글을 남겨 주세요.");
  }

  const duplicate = await database
    .prepare(
      `SELECT id FROM word_comments
       WHERE moderation_key = ? AND word_key = ? AND body = ? AND created_at >= ?
       LIMIT 1`,
    )
    .bind(input.moderationKey, input.wordKey, input.body, oneDayAgo)
    .first<{ id: string }>();

  if (duplicate?.id) {
    throw new DuplicateCommentError("같은 내용의 댓글이 이미 등록되어 있어요.");
  }

  const id = crypto.randomUUID();
  const timestamp = now.toISOString();
  await database
    .prepare(
      `INSERT INTO word_comments (
        id, word_key, word_label, author_name, body, status,
        moderation_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'visible', ?, ?, ?)`,
    )
    .bind(
      id,
      input.wordKey,
      input.wordLabel,
      input.authorName,
      input.body,
      input.moderationKey,
      timestamp,
      timestamp,
    )
    .run();

  return {
    id,
    word_key: input.wordKey,
    word_label: input.wordLabel,
    author_name: input.authorName,
    body: input.body,
    status: "visible" as const,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export async function setCommentStatus(id: string, status: CommentStatus) {
  await ensureCommentsTable();
  const result = await getDatabase()
    .prepare("UPDATE word_comments SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), id)
    .run();

  return Number(result.meta.changes ?? 0) > 0;
}

export async function deleteComment(id: string) {
  await ensureCommentsTable();
  const result = await getDatabase()
    .prepare("DELETE FROM word_comments WHERE id = ?")
    .bind(id)
    .run();

  return Number(result.meta.changes ?? 0) > 0;
}
