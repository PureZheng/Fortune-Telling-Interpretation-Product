# 后端服务架构（MVP）

## 服务分层

- `Controller`: 参数校验、鉴权、响应封装。
- `RuleService`: 规则匹配、分数生成、草稿构建。
- `GuardrailService`: 敏感词检测与风险等级判定。
- `LlmService`: 调用模型完成自然语言生成。
- `UserStore`（可选）: 用户资料缓存。

## 标准处理链路

1. Controller 接收请求并做字段校验。
2. GuardrailService 预检查敏感内容。
3. RuleService 输出 `interpretationDraft`。
4. LlmService 基于对应 prompt 生成结构化结果。
5. GuardrailService 做输出后检查。
6. Controller 返回结果（解读类结果不落库；用户资料按需保存）。

## 错误回退策略

- 模型失败：回退到规则文案。
- 风控命中高危：返回拒答模板。
- 请求参数异常：返回 `code != 0` 的错误结构。
