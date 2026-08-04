export type BulletinDraft = {
  date: string;
  volume: string;
  passage: string;
  title: string;
  preacher: string;
  verse: string;
  worshipOrder: string;
  prayerPoints: string;
  announcements: string;
  schedule: string;
  service: string;
  missionLetter: string;
  missionClosing: string;
  missionSignature: string;
  partnersDomestic: string;
  partnersOverseas: string;
  partnerMilitary: string;
  partnerInstitutions: string;
  monthlyPrayer: string;
  offeringCommittee: string;
  churchTeam: string;
  pages: string[];
};

export type WordDraft = {
  date: string;
  passage: string;
  verse: string;
  title: string;
  meditation: string;
  question: string;
  prayer: string;
};

export type NewsDraft = {
  category: string;
  date: string;
  title: string;
  summary: string;
  body: string;
};

export type ContentType = "bulletin" | "daily_word" | "news";

export type ContentItem = {
  id: string;
  content_type: ContentType;
  slug: string | null;
  title: string;
  content_date: string;
  status: "draft" | "published" | "archived";
  data: Record<string, unknown>;
  media_url: string | null;
  media_type: "image" | "pdf" | null;
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
  updated_at: string;
};

export const defaultBulletin: BulletinDraft = {
  date: "2026년 8월 2일 · 주일",
  volume: "2026년 8월 첫째 주",
  passage: "민수기 14장 21–24절",
  title: "하나님을 온전히 따르는 교회",
  preacher: "서광봉 목사",
  verse:
    "그러나 내 종 갈렙은 그 마음이 그들과 달라서 나를 온전히 따랐은즉 그가 갔던 땅으로 내가 그를 인도하여 들이리니 그 자손이 그 땅을 차지하리라.",
  worshipOrder:
    "경배와 찬양 | 다 같이\n합심 기도 | 다 같이\n신앙고백 · 사도신경 | 다 같이\n입례송 · 나는 예배자 입니다 | 다 같이\n대표기도 | 이주복 장로\n성경 봉독 | 다 같이\n설교 | 서광봉 목사\n봉헌 · 봉헌 찬양 | 다 같이\n광고 | 인도자\n폐회 찬양 · 행복 | 다 같이\n축도 | 서광봉 목사",
  prayerPoints:
    "지역과 나라, 세계를 섬기는 교회가 될 수 있도록\n하나님의 영광과 은혜가 넘치는 교회가 될 수 있도록\n사람을 세우고 살리는 교회가 될 수 있도록\n복음의 능력이 흘러넘치는 교회가 될 수 있도록\n가정마다 하나님의 축복이 보여지는 교회가 될 수 있도록\n선교의 지경이 더욱 확장될 수 있도록",
  announcements:
    "오늘 예배에 참석하신 모든 분들을 주님의 이름으로 환영하고 축복합니다.\n베트남 최민철 선교사님께서 선교편지를 보내주셨습니다. 읽고 기도해 주세요. (영상 및 롤링페이퍼)\n2부 예배는 양성자 전도사님께서 ‘말씀묵상은 마음의 거울이다’라는 제목으로 강의해 주십니다. 모두 참석해주세요.\n시편 쓰기와 비움, 말씀 묵상과 성경 통독을 통해 많은 은혜 받으시기를 기도합니다.",
  schedule:
    "8.02 2부 예배 · 말씀묵상 강의\n7.30–8.06 공주·대전 JDM 지체 단기선교\n8월 베트남 최민철 선교사 선교편지\n8월 시편 쓰기·비움·말씀 묵상·성경 통독",
  service:
    "대표기도 · 이주복 장로\n설교 · 서광봉 목사\n헌금위원 · 이은욱 권사",
  missionLetter:
    "Mission 26 선교대회 | 하나님이 V국 지체들에게 너무나 귀한 경험을 하게 하셨습니다. Mission 26 선교대회를 통해서 자신과 상관없어 보였던 세계 선교라는 단어가 이들의 마음에 자리를 잡았습니다. 주님을 뜨겁게 찬양하고 기도하는 시간을 통해서는 마음에 성령의 불씨가 하나씩 점화되었습니다. V국에도 모임 공동체가 아름답게 세워지길 소망하며 자신이 어떻게 섬겨야 할지 선한 고민을 하기 시작했습니다. 한 영혼이 변화되는 것만큼 위대한 일은 없습니다. 함께 기도해 주신 동역자님들께 감사드립니다.\n공주 대전 JDM 지체들 단기선교 (7.30~8.6) | 간사 다섯 분과 대학생 40명이 이곳 캠퍼스에 복음을 전하기 위해 옵니다. 특히 7월 31일(금), 8월 1일(토) 그리고 3일(월), 3일간 캠퍼스에 들어가 복음을 전하고 3일(월) 저녁에는 초청 잔치를 준비하고 있습니다. 여기도 방학 중이라 학생들이 많지는 않지만, 하나님이 만남을 주선해 주셔서 준비된 영혼을 만날 수 있도록 특별히 기도해 주십시오.\nJ-home을 위해 기도해 주세요. | 형제, 자매 학사에 새로운 학생들을 모집하고 있습니다. V국은 8월 말부터 새 학년 새 학기가 시작됩니다. 그래서 저희도 학사에 기독 신입생 또는 불신자라도 학사의 목적에 적합한 신입생이 들어오길 기도하고 있습니다. 자매 학사에는 한국 단기 선교사 2명과 티(Thy) 이렇게 3명이 살고 있습니다. 1~2명의 여학생이 더 오면 좋겠습니다.\n‘원보나’ 예비 간사를 위해 기도해 주세요. | ‘원보나(응웬바오록)’ 자매가 한창 간사 훈련(KDTT 36기)을 받고 있습니다. 아무리 한국에서 석사까지 공부했다고 해도, 외국인으로서 한국에서 훈련받는 것에는 여러 어려움이 있습니다. 주께서 자매에게 능력을 더하시도록 그리고 무엇보다 V국 캠퍼스 간사에 대한 분명한 소명과 열정을 주시도록 기도해 주십시오.",
  missionClosing:
    "8월 말에 시작될 새 학년 새 학기를 앞두고 다시 고민이 많아졌습니다. 마음도 괜히 분주해지고 뭔가라도 당장 해야 할 것 같은 다급함도 있습니다. 이런 증상이 찾아올 때마다 제 나름대로 하는 한 가지 습관이 있습니다. 짧게는 한 주 전, 길게는 한 달 전의 시간으로 돌아가 봅니다. 그리고 하나님이 어떻게 우리를 오늘까지 인도하셨는가를 차근차근 되짚어 봅니다. 그러면 주님의 선하시고 섬세하신 손길과 보살피심이 선명해집니다. 그리고 그 동일하신 주님의 돌보심이 오늘과 내일에도 함께 할 것을 확신하며 마음이 편안해집니다.\n\n지금까지 이끄신 주님이 여전히 우리와 함께하십니다. 8월에도 동역자님들 모두 주님 안에서 강건하시길 기도합니다.",
  missionSignature: "바다, 하늘, 산, 강 선교사가 올립니다. (7.26)",
  partnersDomestic:
    "김정매(샘물교회)\n박성대(그루터기교회)\n이정숙·정건철(해외캠퍼스개척사역)\n이유종·윤경미(수촌교회)\n최숙영(토담교회)\n최천봉(임마누엘교회)\n황현기(의의나무교회)\n한승묵·한나(한국오엠)\n이음밴드(서지은)\n김용준·김수경(국내 외국인 유학생)",
  partnersOverseas:
    "강석진(캄보디아, 프놈펜새캄보디아교회)\n구상호(캄보디아)\n김성인(캄보디아 품위엘교회)\n김영대(캄보디아)\n명지하(미얀마)\n어윤경·김옥희(인도네시아)\n이동현·이선영(미얀마, GMF)\n이종오(캄보디아)\n차정각(캄보디아, 참소망교회)\n최대호(일본)\n최민철(베트남)\n최상길(캄보디아, 양지예수공동체)\n문주연(필리핀)\n이은우·정혜경(마그렙, T국)\n한왕섭·손영희(캄보디아)\n전현재(인도네시아)\n최진우·정이룸(중동아시아)\n안민마웅(미얀마)\n요슈(미얀마)\n고하임(베트남)\n김건우·송희지(모로코)\n이드림(터키페르시아난민)\n금복음·박평강(튀니지)\n최선한·박목자(카자흐스탄)",
  partnerMilitary: "제2포병여단선진교회\n365대대은혜광염교회",
  partnerInstitutions: "CCC국내외국인사역부\n중거신학원(중국)\n중앙신학교",
  monthlyPrayer:
    "2일 | 이주복 장로\n9일 | 서미경 전도사\n16일 | 이성창 집사\n23일 | 김정실 목사\n30일 | 서미경 전도사",
  offeringCommittee: "8월 · 이은욱 권사\n9월 · 장보경 집사",
  churchTeam:
    "당회장 | 서광봉 목사\n목사 | 김정실 목사\n장로 | 이주복 · 서정봉\n전도사 | 양성자 · 서미경 · 하혜련\n파송선교사 | 이은욱 · 정혜경 · 고하임 · 이드림 · 김동철 · 권수진\n주소 | 서울시 마포구 월드컵로 137, 302호",
  pages: [],
};

export const defaultWord: WordDraft = {
  date: "2026. 08. 04. 화요일",
  passage: "시편 119편 105절",
  verse:
    "주의 말씀은 내 발에 등이요 내 길에 빛이니이다.",
  title: "말씀의 빛을 따라 한 걸음씩",
  meditation:
    "하나님은 먼 길의 모든 장면을 한꺼번에 보여 주시기보다, 오늘 걸어야 할 한 걸음을 말씀으로 비춰 주십니다. 앞이 선명하지 않을 때에도 말씀을 가까이하면 두려움보다 순종을 선택할 수 있습니다. 오늘 내 발 앞을 밝혀 주시는 말씀을 붙들고 작은 한 걸음을 내디뎌 보세요.",
  question: "오늘 말씀의 빛을 따라 순종해야 할 한 가지는 무엇인가요?",
  prayer:
    "말씀으로 제 길을 밝혀 주시는 주님, 앞이 보이지 않을 때에도 두려워하지 않고 오늘 주신 말씀을 따라 한 걸음씩 순종하게 해 주세요.",
};

const augustSecondWord: WordDraft = {
  date: "2026. 08. 02. 주일",
  passage: "민수기 14장 24절",
  verse:
    "그러나 내 종 갈렙은 그 마음이 그들과 달라서 나를 온전히 따랐은즉 그가 갔던 땅으로 내가 그를 인도하여 들이리니 그 자손이 그 땅을 차지하리라.",
  title: "마음을 다해 주님을 따르는 하루",
  meditation:
    "갈렙은 상황이 쉬워서가 아니라 하나님을 신뢰했기 때문에 다른 마음을 품을 수 있었습니다. 믿음은 많은 사람이 가는 길을 무작정 따르는 것이 아니라, 하나님의 약속을 붙들고 끝까지 순종하는 것입니다. 오늘도 흔들리는 마음을 주님께 드리며 온전히 따르는 한 사람이 되어 보세요.",
  question: "오늘 내가 사람들의 시선보다 하나님의 말씀을 따라 선택해야 할 일은 무엇인가요?",
  prayer:
    "신실하신 주님, 상황과 사람의 말에 흔들리지 않고 갈렙처럼 주님을 온전히 신뢰하며 따르게 해 주세요.",
};

const augustThirdWord: WordDraft = {
  date: "2026. 08. 03. 월요일",
  passage: "잠언 3장 5–6절",
  verse:
    "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라. 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라.",
  title: "내 생각보다 주님의 길을 신뢰하기",
  meditation:
    "우리는 앞일을 알 수 없을 때 더 많이 계산하고 걱정합니다. 그러나 하나님은 모든 답을 먼저 알아내라고 하시지 않고, 마음을 다해 주님을 신뢰하라고 말씀하십니다. 오늘의 계획과 염려를 주님께 맡기고, 내가 이해한 만큼이 아니라 말씀하신 만큼 순종해 보세요.",
  question: "오늘 내가 주님께 맡기고 믿음으로 순종해야 할 일은 무엇인가요?",
  prayer:
    "길을 인도하시는 주님, 제 생각만 의지하지 않게 하시고 모든 순간 주님을 인정하며 믿음으로 걸어가게 해 주세요.",
};

function createDefaultWordItem(
  contentDate: string,
  word: WordDraft,
): ContentItem {
  return {
    id: `default-daily-word-${contentDate}`,
    content_type: "daily_word",
    slug: `daily-word-${contentDate}`,
    title: word.title,
    content_date: contentDate,
    status: "published",
    data: word,
    media_url: null,
    media_type: null,
    is_featured: contentDate === "2026-08-04",
    sort_order: 0,
    published_at: `${contentDate}T00:00:00+09:00`,
    updated_at: `${contentDate}T00:00:00+09:00`,
  };
}

export const defaultWordItems: ContentItem[] = [
  createDefaultWordItem("2026-08-04", defaultWord),
  createDefaultWordItem("2026-08-03", augustThirdWord),
  createDefaultWordItem("2026-08-02", augustSecondWord),
];

export function mergePublishedWords(items: ContentItem[]) {
  const byDate = new Map(
    defaultWordItems.map((item) => [item.content_date, item]),
  );

  for (const item of items) {
    if (item.content_type === "daily_word" && item.status === "published") {
      byDate.set(item.content_date, item);
    }
  }

  return [...byDate.values()].sort((a, b) =>
    b.content_date.localeCompare(a.content_date),
  );
}

export const defaultNews: NewsDraft = {
  category: "예배",
  date: "2026. 08. 02",
  title: "8월 첫째 주 주일예배 안내",
  summary: "온 세대가 함께 모여 찬양하고 말씀을 나누는 예배로 초대합니다.",
  body:
    "새로운 달을 감사로 시작합니다. 이번 주 예배와 공동체 모임, 다음세대 활동과 함께 섬길 자리를 확인해 주세요.",
};

function readString(
  data: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export function bulletinFromItem(item?: ContentItem | null): BulletinDraft {
  if (!item) return defaultBulletin;

  const storedPassage = readString(item.data, "passage", "");
  const storedTitle = readString(item.data, "title", item.title || "");
  const isStarterSample =
    item.content_date === "2026-08-02" &&
    (storedPassage.includes("요한복음 6장") || storedTitle === "작은 나눔, 큰 은혜");

  if (isStarterSample) return defaultBulletin;

  return {
    date: readString(item.data, "date", defaultBulletin.date),
    volume: readString(item.data, "volume", defaultBulletin.volume),
    passage: readString(item.data, "passage", defaultBulletin.passage),
    title: readString(item.data, "title", item.title || defaultBulletin.title),
    preacher: readString(item.data, "preacher", defaultBulletin.preacher),
    verse: readString(item.data, "verse", defaultBulletin.verse),
    worshipOrder: readString(
      item.data,
      "worshipOrder",
      defaultBulletin.worshipOrder,
    ),
    prayerPoints: readString(
      item.data,
      "prayerPoints",
      defaultBulletin.prayerPoints,
    ),
    announcements: readString(
      item.data,
      "announcements",
      defaultBulletin.announcements,
    ),
    schedule: readString(item.data, "schedule", defaultBulletin.schedule),
    service: readString(item.data, "service", defaultBulletin.service),
    missionLetter: readString(item.data, "missionLetter", defaultBulletin.missionLetter),
    missionClosing: readString(item.data, "missionClosing", defaultBulletin.missionClosing),
    missionSignature: readString(item.data, "missionSignature", defaultBulletin.missionSignature),
    partnersDomestic: readString(item.data, "partnersDomestic", defaultBulletin.partnersDomestic),
    partnersOverseas: readString(item.data, "partnersOverseas", defaultBulletin.partnersOverseas),
    partnerMilitary: readString(item.data, "partnerMilitary", defaultBulletin.partnerMilitary),
    partnerInstitutions: readString(item.data, "partnerInstitutions", defaultBulletin.partnerInstitutions),
    monthlyPrayer: readString(item.data, "monthlyPrayer", defaultBulletin.monthlyPrayer),
    offeringCommittee: readString(item.data, "offeringCommittee", defaultBulletin.offeringCommittee),
    churchTeam: readString(item.data, "churchTeam", defaultBulletin.churchTeam),
    pages: [],
  };
}

export function wordFromItem(item?: ContentItem | null): WordDraft {
  if (!item) return defaultWord;
  return {
    date: readString(item.data, "date", defaultWord.date),
    passage: readString(item.data, "passage", defaultWord.passage),
    verse: readString(item.data, "verse", defaultWord.verse),
    title: readString(item.data, "title", item.title || defaultWord.title),
    meditation: readString(item.data, "meditation", defaultWord.meditation),
    question: readString(item.data, "question", defaultWord.question),
    prayer: readString(item.data, "prayer", defaultWord.prayer),
  };
}

export function newsFromItem(item?: ContentItem | null): NewsDraft {
  if (!item) return defaultNews;
  return {
    category: readString(item.data, "category", defaultNews.category),
    date: readString(item.data, "date", defaultNews.date),
    title: readString(item.data, "title", item.title || defaultNews.title),
    summary: readString(item.data, "summary", defaultNews.summary),
    body: readString(item.data, "body", defaultNews.body),
  };
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
