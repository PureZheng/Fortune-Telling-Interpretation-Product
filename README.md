# AI Fortune MVP

一个面向普通用户的“算命解读”产品 MVP，采用规则引擎 + 大模型混合架构，支持基础命理解读、每日运势和算卦解读。

## MVP 范围

- 基础命理解读：输入出生日期等信息，输出结构化解读与行动建议。
- 每日运势：按用户时区提供每日总运和分项建议。
- 算卦解读：用户输入问题后起卦并返回现代语境解释。

## 项目结构

- `frontend/`：前端页面与交互（当前为占位目录）。
- `backend/src/`：后端服务入口与路由骨架。
- `backend/rules/`：规则引擎映射与保底逻辑。
- `backend/prompts/`：大模型提示词模板与输出约束。
- `docs/`：PRD、接口规范、合规与交付计划。

## 关键设计原则

- 规则优先：先由规则层生成结构化草稿，保证稳定可控。
- LLM 润色：基于草稿生成自然语言，提高可读性和个性化。
- 非确定性表达：避免绝对化预测，输出建议而非命令。
- 合规优先：默认包含免责声明、敏感话题拦截、隐私删除路径。

## 快速启动（规划阶段）

当前仓库完成的是 MVP 设计与骨架文件，开发阶段可按以下顺序推进：

1. 根据 `docs/api-spec.md` 完成后端接口实现。
2. 根据 `backend/rules/` 与 `backend/prompts/` 接入推理链路。
3. 在 `frontend/` 完成信息录入与结果展示。
4. 按 `docs/mvp-delivery.md` 做里程碑验收和灰度发布。

## 火山引擎 Key 配置

在 `backend/` 目录下新建 `.env` 文件（可从 `backend/.env.example` 复制），填写：

- `ARK_API_KEY`：你的火山方舟 API Key
- `ARK_BASE_URL`：默认 `https://ark.cn-beijing.volces.com/api/v3`
- `ARK_MODEL`：火山方舟推理接入点 ID（Endpoint ID）

说明：

- 配置了上述变量后，后端会优先调用火山大模型。
- 未配置或调用失败时，会自动回退到本地规则文案，保证接口可用。

## 文档索引

- PRD：`docs/prd-mvp.md`
- API 规范：`docs/api-spec.md`
- 合规与风控：`docs/compliance.md`
- 里程碑计划：`docs/mvp-delivery.md`