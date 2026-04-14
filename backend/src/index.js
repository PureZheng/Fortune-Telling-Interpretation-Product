const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { buildReadingDraft, buildFortuneDraft, buildDivinationDraft } = require("./ruleEngine");
const { createReadingResult, createDailyResult, createDivinationResult, createFollowupAnswer } = require("./llmService");
const { checkInputRisk, sanitizeOutput } = require("./guardrails");
const { saveUserProfile, getUserProfile } = require("./userStore");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

function ok(data) {
  return { code: 0, message: "ok", data };
}

function fail(message, code = 1) {
  return { code, message, data: null };
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "frontend", "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json(ok({ status: "up" }));
});

app.post("/api/user/profile", (req, res) => {
  const { userId, gender, birthDate, birthTime, birthPlace, timezone, calendarType, topic } = req.body || {};
  if (!userId) {
    return res.status(400).json(fail("userId 为必填项"));
  }
  const saved = saveUserProfile({
    userId,
    gender: gender || "unknown",
    birthDate: birthDate || "",
    birthTime: birthTime || "12:00",
    birthPlace: birthPlace || "",
    timezone: timezone || "Asia/Shanghai",
    calendarType: calendarType || "solar",
    topic: topic || "",
  });
  return res.json(ok(saved));
});

app.get("/api/user/profile", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json(fail("userId 为必填项"));
  }
  const profile = getUserProfile(String(userId));
  if (!profile) {
    return res.status(404).json(fail("未找到该用户信息"));
  }
  return res.json(ok(profile));
});

app.post("/api/reading/base", async (req, res) => {
  const { userId, birthDate, birthTime, topic, gender, birthPlace, timezone, calendarType } = req.body || {};
  if (!userId || !birthDate) {
    return res.status(400).json(fail("userId 和 birthDate 为必填项"));
  }

  const draft = buildReadingDraft(req.body);
  const result = sanitizeOutput(await createReadingResult(draft));
  const readingId = `r_${Date.now()}`;
  const payload = {
    readingId,
    ...result,
    createdAt: new Date().toISOString(),
    userId,
    birthTime: birthTime || "12:00",
    topic: topic || "career",
    gender: gender || "unknown",
    birthPlace: birthPlace || "unknown",
    timezone: timezone || "Asia/Shanghai",
    calendarType: calendarType || "solar",
    bazi: draft.bazi,
  };
  return res.json(ok(payload));
});

app.post("/api/fortune/daily", async (req, res) => {
  const { userId, date, period = "daily" } = req.body || {};
  if (!userId) {
    return res.status(400).json(fail("userId 为必填项"));
  }
  const periodList = ["daily", "weekly", "monthly", "yearly"];
  if (!periodList.includes(period)) {
    return res.status(400).json(fail("period 仅支持 daily/weekly/monthly/yearly"));
  }

  const draft = buildFortuneDraft(period);
  const result = sanitizeOutput(await createDailyResult(draft, period));
  const fortuneId = `f_${Date.now()}`;
  const payload = {
    fortuneId,
    date: date || new Date().toISOString().slice(0, 10),
    overall: Math.round(
      (result.dimensions.career +
        result.dimensions.relationship +
        result.dimensions.wealth +
        result.dimensions.health) /
        4
    ),
    tag: "平稳",
    period,
    ...result,
    createdAt: new Date().toISOString(),
    userId,
  };
  return res.json(ok(payload));
});

app.post("/api/divination", async (req, res) => {
  const { userId, question } = req.body || {};
  if (!userId || !question) {
    return res.status(400).json(fail("userId 和 question 为必填项"));
  }

  const risk = checkInputRisk(question);
  if (risk.blocked) {
    return res.status(400).json(fail(risk.message, 2));
  }

  const draft = buildDivinationDraft(question);
  const result = sanitizeOutput(await createDivinationResult(draft));
  const divinationId = `d_${Date.now()}`;
  const payload = {
    divinationId,
    hexagramCode: draft.hexagram.code,
    hexagramName: draft.hexagram.name,
    symbol: draft.hexagram.keyword,
    interpretation: result.summary,
    actionAdvice: result.advice,
    riskNote: risk.message || result.riskNote,
    createdAt: new Date().toISOString(),
    userId,
  };
  return res.json(ok(payload));
});

app.post("/api/assistant/followup", async (req, res) => {
  const { userId, moduleName, currentResult, question } = req.body || {};
  if (!userId || !moduleName || !currentResult || !question) {
    return res.status(400).json(fail("userId、moduleName、currentResult、question 为必填项"));
  }
  const risk = checkInputRisk(question);
  if (risk.blocked) {
    return res.status(400).json(fail(risk.message, 2));
  }
  const answer = await createFollowupAnswer({ moduleName, currentResult, question });
  return res.json(
    ok({
      answer,
      moduleName,
      question,
      createdAt: new Date().toISOString(),
      userId,
    })
  );
});

app.listen(port, () => {
  console.log(`MVP backend is running at http://localhost:${port}`);
});
