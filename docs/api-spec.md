# API 规范（MVP）

## 通用约定

- Base URL: `/api`
- Content-Type: `application/json`
- 时间字段使用 ISO 8601。
- 所有响应统一结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

## 1) POST `/api/reading/base`

生成基础命理解读。

### Request

```json
{
  "userId": "u_123",
  "birthDate": "1998-06-16",
  "birthTime": "08:30",
  "gender": "female",
  "birthPlace": "Shanghai",
  "topic": "career",
  "timezone": "Asia/Shanghai"
}
```

### Response.data

```json
{
  "readingId": "r_001",
  "summary": "近期整体节奏偏稳，适合做结构化推进。",
  "dimensions": {
    "career": 78,
    "relationship": 66,
    "wealth": 71,
    "health": 69
  },
  "advice": ["先完成高优先级事项", "减少冲动决策"],
  "riskNote": "避免对短期波动过度解读。",
  "confidence": "medium",
  "createdAt": "2026-04-13T08:00:00Z"
}
```

## 2) POST `/api/fortune/daily`

获取或生成周期运势（每日/每周/每月/每年）。

### Request

```json
{
  "userId": "u_123",
  "period": "weekly",
  "date": "2026-04-13",
  "timezone": "Asia/Shanghai"
}
```

### Response.data

```json
{
  "fortuneId": "f_001",
  "period": "weekly",
  "date": "2026-04-13",
  "overall": 74,
  "dimensions": {
    "career": 76,
    "relationship": 68,
    "wealth": 73,
    "health": 70
  },
  "tag": "平稳",
  "advice": "以稳为主，优先处理可闭环任务。",
  "caution": "避免情绪化沟通。",
  "createdAt": "2026-04-13T00:01:00Z"
}
```

## 3) POST `/api/divination`

根据用户问题起卦并解读。

### Request

```json
{
  "userId": "u_123",
  "question": "我下个月是否适合换工作？",
  "method": "random_hexagram",
  "timezone": "Asia/Shanghai"
}
```

### Response.data

```json
{
  "divinationId": "d_001",
  "hexagramCode": "23",
  "hexagramName": "剥",
  "symbol": "MountainOverEarth",
  "interpretation": "当前阶段更适合去旧立新，先稳住基本盘。",
  "actionAdvice": ["先做岗位信息收集", "保留至少一个稳妥选项"],
  "riskNote": "避免在信息不足时做不可逆决定。",
  "createdAt": "2026-04-13T09:12:00Z"
}
```

