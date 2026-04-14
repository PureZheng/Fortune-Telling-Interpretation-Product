# 规则引擎设计（MVP）

## 目标

- 在模型不可用或输出波动时提供稳定结果。
- 为模型提供结构化草稿，降低幻觉和跑题概率。

## 输入

```json
{
  "birthDate": "1998-06-16",
  "birthTime": "08:30",
  "gender": "female",
  "birthPlace": "Shanghai",
  "topic": "career",
  "timezone": "Asia/Shanghai"
}
```

## 处理流程

1. 提取特征：星座、生肖、时间段标签（morning/afternoon/night）。
2. 匹配规则：按 `topic` 选择对应维度权重模板。
3. 计算分数：生成四维 `baseScores`。
4. 生成草稿：包含语气、关注方向、风险模板。
5. 交给 LLM：做语言润色和建议扩写。

## 保底策略

- 规则命中不足时返回“通用建议模板”。
- 模型超时或失败时直接返回规则文案。
- 敏感话题命中时优先返回拒答模板。
