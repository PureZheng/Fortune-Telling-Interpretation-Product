function withDimensions(baseScores) {
  return {
    career: baseScores.career,
    relationship: baseScores.relationship,
    wealth: baseScores.wealth,
    health: baseScores.health,
  };
}

function createReadingFallback(draft) {
  const baziText = draft.bazi
    ? `你的八字为 ${draft.bazi.pillars.year}年、${draft.bazi.pillars.month}月、${draft.bazi.pillars.day}日、${draft.bazi.pillars.hour}时，日主为${draft.bazi.dayMaster}。`
    : "";
  return {
    summary: `${baziText}你近期整体节奏偏稳，${draft.focus}方向更值得重点投入。`,
    dimensions: withDimensions(draft.baseScores),
    advice: ["先完成关键任务再拓展", "避免冲动承诺", "给自己预留缓冲时间"],
    riskNote: "避免对短期波动做过度解读。",
    confidence: "medium",
  };
}

function createDailyFallback(draft, period = "daily") {
  const overall = Math.round(
    (draft.baseScores.career +
      draft.baseScores.relationship +
      draft.baseScores.wealth +
      draft.baseScores.health) /
      4
  );
  const periodTextMap = {
    daily: "今日",
    weekly: "本周",
    monthly: "本月",
    yearly: "今年",
  };
  const periodText = periodTextMap[period] || "近期";
  return {
    summary: `${periodText}整体运势 ${overall >= 75 ? "偏顺" : "平稳"}，适合稳中求进。`,
    dimensions: withDimensions(draft.baseScores),
    advice: ["先做可闭环的小目标", "重要沟通提前准备"],
    riskNote: "减少情绪化表达可降低沟通摩擦。",
    confidence: "medium",
  };
}

function createDivinationFallback(draft) {
  return {
    summary: `${draft.hexagram.name}卦提示“${draft.hexagram.keyword}”，当前更适合循序推进。`,
    dimensions: {
      career: 72,
      relationship: 66,
      wealth: 68,
      health: 69,
    },
    advice: ["先收集更多信息再决策", "保留至少一个备选方案"],
    riskNote: "避免在信息不完整时做不可逆决定。",
    confidence: "low",
  };
}

function extractJson(text) {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (_err) {
    const matched = text.match(/\{[\s\S]*\}/);
    if (!matched) {
      return null;
    }
    try {
      return JSON.parse(matched[0]);
    } catch (_err2) {
      return null;
    }
  }
}

async function callArkModel(prompt) {
  const apiKey = process.env.ARK_API_KEY;
  const baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const model = process.env.ARK_MODEL;
  if (!apiKey || !model) {
    return null;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "你是娱乐向命理解读助手。请严格输出JSON，字段仅包含summary、dimensions、advice、riskNote、confidence。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  return extractJson(content);
}

async function callArkText(prompt) {
  const apiKey = process.env.ARK_API_KEY;
  const baseUrl = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const model = process.env.ARK_MODEL;
  if (!apiKey || !model) {
    return null;
  }
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "你是命理解读助手。请基于给定结果做追问回答，回答应清晰、简短、可执行，避免绝对化表达。",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!response.ok) {
    return null;
  }
  const result = await response.json();
  return result?.choices?.[0]?.message?.content || null;
}

function normalizeResult(parsed, fallback) {
  if (!parsed || typeof parsed !== "object") {
    return fallback;
  }
  const inputDimensions = parsed.dimensions || {};
  const normalizedDimensions = {
    career:
      inputDimensions.career ??
      inputDimensions.work ??
      inputDimensions["事业"] ??
      fallback.dimensions.career,
    relationship:
      inputDimensions.relationship ??
      inputDimensions.love ??
      inputDimensions["感情"] ??
      fallback.dimensions.relationship,
    wealth:
      inputDimensions.wealth ??
      inputDimensions.finance ??
      inputDimensions["财运"] ??
      fallback.dimensions.wealth,
    health:
      inputDimensions.health ??
      inputDimensions["健康"] ??
      fallback.dimensions.health,
  };

  return {
    summary: parsed.summary || fallback.summary,
    dimensions: normalizedDimensions,
    advice: Array.isArray(parsed.advice) ? parsed.advice : fallback.advice,
    riskNote: parsed.riskNote || fallback.riskNote,
    confidence: parsed.confidence || fallback.confidence,
  };
}

async function createReadingResult(draft) {
  const fallback = createReadingFallback(draft);
  const prompt = `根据以下草稿生成JSON，重点解读八字和五行强弱：${JSON.stringify(draft)}`;
  const parsed = await callArkModel(prompt);
  return normalizeResult(parsed, fallback);
}

async function createDailyResult(draft, period = "daily") {
  const fallback = createDailyFallback(draft, period);
  const prompt = `生成${period}运势JSON，输入草稿：${JSON.stringify(draft)}`;
  const parsed = await callArkModel(prompt);
  return normalizeResult(parsed, fallback);
}

async function createDivinationResult(draft) {
  const fallback = createDivinationFallback(draft);
  const prompt = `生成算卦解读JSON，输入草稿：${JSON.stringify(draft)}`;
  const parsed = await callArkModel(prompt);
  return normalizeResult(parsed, fallback);
}

async function createFollowupAnswer(context) {
  const { moduleName, currentResult, question } = context;
  const fallback = `基于当前${moduleName}结果，你可以优先从“${currentResult?.riskNote || "风险控制"}”入手，先做一周的小规模尝试，再根据反馈调整。`;
  const prompt = `当前模块：${moduleName}\n当前结果：${JSON.stringify(
    currentResult
  )}\n用户追问：${question}\n请给出150字内的追问回答，并提供2条行动建议。`;
  const text = await callArkText(prompt);
  return text || fallback;
}

module.exports = {
  createReadingResult,
  createDailyResult,
  createDivinationResult,
  createFollowupAnswer,
};
