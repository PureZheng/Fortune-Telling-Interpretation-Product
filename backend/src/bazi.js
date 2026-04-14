const solarlunar = require("solarlunar").default;

const STEMS = "甲乙丙丁戊己庚辛壬癸".split("");
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥".split("");

const STEM_ELEMENT = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

const BRANCH_ELEMENT = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

const STEM_YINYANG = {
  甲: "阳",
  乙: "阴",
  丙: "阳",
  丁: "阴",
  戊: "阳",
  己: "阴",
  庚: "阳",
  辛: "阴",
  壬: "阳",
  癸: "阴",
};

const GENERATE = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROL = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

function getHourBranchIndex(hour) {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

function getHourPillar(dayStem, hour) {
  const dayStemIndex = STEMS.indexOf(dayStem);
  const hourBranchIndex = getHourBranchIndex(hour);
  const stemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
  return `${STEMS[stemIndex]}${BRANCHES[hourBranchIndex]}`;
}

function addElementCount(counter, pillar) {
  const stem = pillar[0];
  const branch = pillar[1];
  counter[STEM_ELEMENT[stem]] += 1;
  counter[BRANCH_ELEMENT[branch]] += 1;
}

function isSameYinYang(aStem, bStem) {
  return STEM_YINYANG[aStem] === STEM_YINYANG[bStem];
}

function tenGod(dayStem, targetStem) {
  const dayElement = STEM_ELEMENT[dayStem];
  const targetElement = STEM_ELEMENT[targetStem];
  const samePolarity = isSameYinYang(dayStem, targetStem);
  if (dayElement === targetElement) {
    return samePolarity ? "比肩" : "劫财";
  }
  if (GENERATE[dayElement] === targetElement) {
    return samePolarity ? "食神" : "伤官";
  }
  if (GENERATE[targetElement] === dayElement) {
    return samePolarity ? "偏印" : "正印";
  }
  if (CONTROL[dayElement] === targetElement) {
    return samePolarity ? "偏财" : "正财";
  }
  if (CONTROL[targetElement] === dayElement) {
    return samePolarity ? "七杀" : "正官";
  }
  return "未知";
}

function getYongShen(wuxing) {
  const pairs = Object.entries(wuxing);
  pairs.sort((a, b) => a[1] - b[1]);
  const least = pairs[0][0];
  const secondLeast = pairs[1][0];
  return {
    primary: least,
    secondary: secondLeast,
    suggestion: `五行偏弱在${least}，可优先补${least}，并兼顾${secondLeast}。`,
  };
}

function buildLuckTrend(dayMasterElement, currentYear) {
  const seq = ["木", "火", "土", "金", "水"];
  const idx = seq.indexOf(dayMasterElement);
  const next10y = Array.from({ length: 3 }).map((_, i) => {
    const start = currentYear + i * 10;
    const element = seq[(idx + i) % seq.length];
    return {
      period: `${start}-${start + 9}`,
      element,
      trend: `${element}运势阶段，适合${element === "木" ? "学习成长" : element === "火" ? "主动突破" : element === "土" ? "稳健积累" : element === "金" ? "结构优化" : "修整蓄势"}。`,
    };
  });
  const liuNian = Array.from({ length: 3 }).map((_, i) => {
    const year = currentYear + i;
    const element = seq[(idx + i + 1) % seq.length];
    return {
      year,
      element,
      hint: `${year}年偏${element}，建议以${element === "火" ? "执行力" : element === "水" ? "弹性应变" : "稳步推进"}为主。`,
    };
  });
  return { daYun: next10y, liuNian };
}

function computeBazi(birthDate, birthTime = "12:00") {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split("-").map(Number);
  const hour = Number((birthTime || "12:00").split(":")[0]);
  const lunar = solarlunar.solar2lunar(year, month, day);
  const yearPillar = lunar.gzYear;
  const monthPillar = lunar.gzMonth;
  const dayPillar = lunar.gzDay;
  const hourPillar = getHourPillar(dayPillar[0], Number.isNaN(hour) ? 12 : hour);

  const wuxing = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach((pillar) => addElementCount(wuxing, pillar));
  const dayStem = dayPillar[0];
  const shiShen = {
    yearStem: tenGod(dayStem, yearPillar[0]),
    monthStem: tenGod(dayStem, monthPillar[0]),
    hourStem: tenGod(dayStem, hourPillar[0]),
  };
  const yongShen = getYongShen(wuxing);
  const luck = buildLuckTrend(STEM_ELEMENT[dayStem], new Date().getFullYear());

  return {
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    dayMaster: dayPillar[0],
    zodiac: lunar.animal,
    wuxing,
    shiShen,
    yongShen,
    luck,
  };
}

module.exports = {
  computeBazi,
};
