const HIGH_RISK_PATTERN =
  /自杀|自残|死亡|死期|绝症|癌症|违法|犯罪|必中|稳赚|内部消息|诊断/;
const MEDIUM_RISK_PATTERN = /离婚|破产|官司|抑郁|焦虑|裁员|失败/;

function checkInputRisk(text = "") {
  if (!text) {
    return { blocked: false, level: "none" };
  }
  if (HIGH_RISK_PATTERN.test(text)) {
    return {
      blocked: true,
      level: "high",
      message: "该问题超出可解读范围，建议咨询专业机构获取帮助。",
    };
  }
  if (MEDIUM_RISK_PATTERN.test(text)) {
    return {
      blocked: false,
      level: "medium",
      message: "以下内容仅供参考，请结合现实情况理性判断。",
    };
  }
  return { blocked: false, level: "low" };
}

function sanitizeOutput(result) {
  const safeResult = { ...result };
  if (!safeResult.riskNote) {
    safeResult.riskNote = "内容仅供娱乐与参考，请理性决策。";
  }
  return safeResult;
}

module.exports = {
  checkInputRisk,
  sanitizeOutput,
};
