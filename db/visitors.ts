const createVisitorsTableSql = `
  CREATE TABLE IF NOT EXISTS daily_visitors (
    day TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (day, visitor_id)
  )
`;

let initialization: Promise<void> | null = null;
let visitorDatabase: D1Database | null = null;

export function setVisitorDatabase(database: D1Database | undefined) {
  visitorDatabase = database ?? null;
}

function getDatabase() {
  if (!visitorDatabase) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }

  return visitorDatabase;
}

async function ensureVisitorsTable() {
  if (!initialization) {
    initialization = getDatabase()
      .prepare(createVisitorsTableSql)
      .run()
      .then(() => undefined)
      .catch((error) => {
        initialization = null;
        throw error;
      });
  }

  await initialization;
}

export function getKoreaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function recordDailyVisitor(day: string, visitorId: string) {
  await ensureVisitorsTable();
  const database = getDatabase();

  const insert = await database
    .prepare(
      "INSERT OR IGNORE INTO daily_visitors (day, visitor_id, created_at) VALUES (?, ?, ?)",
    )
    .bind(day, visitorId, new Date().toISOString())
    .run();

  const todayRow = await database
    .prepare("SELECT COUNT(*) AS count FROM daily_visitors WHERE day = ?")
    .bind(day)
    .first<{ count: number }>();

  const totalRow = await database
    .prepare("SELECT COUNT(*) AS count FROM daily_visitors")
    .first<{ count: number }>();

  return {
    count: Number(todayRow?.count ?? 0),
    todayCount: Number(todayRow?.count ?? 0),
    totalCount: Number(totalRow?.count ?? 0),
    counted: Number(insert.meta.changes ?? 0) > 0,
  };
}

export async function getDailyVisitorCount(day: string) {
  await ensureVisitorsTable();
  const row = await getDatabase()
    .prepare("SELECT COUNT(*) AS count FROM daily_visitors WHERE day = ?")
    .bind(day)
    .first<{ count: number }>();

  return Number(row?.count ?? 0);
}

export async function getTotalVisitorCount() {
  await ensureVisitorsTable();
  const row = await getDatabase()
    .prepare("SELECT COUNT(*) AS count FROM daily_visitors")
    .first<{ count: number }>();

  return Number(row?.count ?? 0);
}
