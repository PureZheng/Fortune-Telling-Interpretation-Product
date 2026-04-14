# 统一输出 Schema（MVP）

规则层与模型层共享同一输出结构，便于前端稳定渲染。

## InterpretationSchema

```json
{
  "summary": "string",
  "dimensions": {
    "career": 0,
    "relationship": 0,
    "wealth": 0,
    "health": 0
  },
  "advice": ["string"],
  "riskNote": "string",
  "confidence": "low|medium|high"
}
```

## 字段说明

- `summary`: 1~2 句总体解读，避免绝对化判断。
- `dimensions`: 四维评分，范围 0~100。
- `advice`: 可执行建议，建议 2~3 条。
- `riskNote`: 风险提示，必须为非恐吓表达。
- `confidence`: 内容置信等级，由规则覆盖度与模型稳定性共同决定。

## 规则层输出草稿

规则层先输出 `interpretationDraft`，再交给模型层润色：

```json
{
  "profileTags": ["earth_sign", "morning_birth"],
  "baseScores": {
    "career": 72,
    "relationship": 65,
    "wealth": 68,
    "health": 70
  },
  "focus": "career",
  "tone": "calm"
}
```
