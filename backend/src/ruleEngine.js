const { computeBazi } = require("./bazi");

function zodiacFromDate(birthDate) {
  const year = new Date(birthDate).getUTCFullYear();
  const zodiacs = [
    "猴",
    "鸡",
    "狗",
    "猪",
    "鼠",
    "牛",
    "虎",
    "兔",
    "龙",
    "蛇",
    "马",
    "羊",
  ];
  return zodiacs[year % 12];
}

function starSign(month, day) {
  const signs = [
    ["摩羯座", 20],
    ["水瓶座", 19],
    ["双鱼座", 21],
    ["白羊座", 20],
    ["金牛座", 21],
    ["双子座", 22],
    ["巨蟹座", 23],
    ["狮子座", 23],
    ["处女座", 23],
    ["天秤座", 24],
    ["天蝎座", 23],
    ["射手座", 22],
    ["摩羯座", 31],
  ];
  return day < signs[month - 1][1] ? signs[month - 1][0] : signs[month][0];
}

function buildBaseScores(topic = "career") {
  const base = { career: 70, relationship: 68, wealth: 69, health: 67 };
  if (base[topic] !== undefined) {
    base[topic] += 8;
  }
  return base;
}

function buildReadingDraft(payload) {
  const date = new Date(payload.birthDate);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const scores = buildBaseScores(payload.topic);
  const bazi = computeBazi(payload.birthDate, payload.birthTime);
  return {
    profileTags: [zodiacFromDate(payload.birthDate), starSign(month, day)],
    profile: {
      gender: payload.gender || "unknown",
      birthPlace: payload.birthPlace || "unknown",
      timezone: payload.timezone || "Asia/Shanghai",
      calendarType: payload.calendarType || "solar",
    },
    baseScores: scores,
    focus: payload.topic || "career",
    tone: "calm",
    bazi,
  };
}

function buildFortuneDraft(period = "daily") {
  const periodBoost = {
    daily: 0,
    weekly: 2,
    monthly: 4,
    yearly: 6,
  };
  const seed = Math.floor(Math.random() * 10) + (periodBoost[period] || 0);
  return {
    baseScores: {
      career: 68 + seed,
      relationship: 64 + seed,
      wealth: 66 + seed,
      health: 65 + seed,
    },
    tone: "steady",
    period,
  };
}

function buildDivinationDraft(question = "") {
  const hexagrams = [
    { code: "01", name: "乾", keyword: "主动开创" },
    { code: "02", name: "坤", keyword: "顺势承载" },
    { code: "23", name: "剥", keyword: "去旧立新" },
    { code: "46", name: "升", keyword: "循序向上" },
  ];
  const chosen = hexagrams[Math.floor(Math.random() * hexagrams.length)];
  return {
    hexagram: chosen,
    focus: question.includes("工作") ? "career_decision" : "general",
    tone: "cautious",
  };
}

module.exports = {
  buildReadingDraft,
  buildFortuneDraft,
  buildDivinationDraft,
};
