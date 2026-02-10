# DM 跑团工具 - 技术架构（双服务、共享用户与会员）

## 一、总体原则

- **角色卡**与 **DM 战役工具** 为**两个独立服务**，可独立部署、独立技术栈、独立数据库（战役数据仅在 DM 服务）。
- **用户身份**与**会员信息**由角色卡服务统一管理，DM 服务**不存储用户表**，通过「认证与鉴权」共享。
- **角色数据**始终在角色卡服务；DM 服务需要角色名/头像/先攻等时，通过**调用角色卡 API** 获取（携带用户凭证）。

---

## 二、服务边界

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        用户浏览器（同一父域）                              │
│  cs.dimvision.xyz  ←→  角色卡前端    │    dm.dimvision.xyz  ←→  DM 工具前端 │
└─────────────────────────────────────────────────────────────────────────┘
         │ 登录/会话/会员            │ 携带 JWT 访问 DM 接口
         ▼                          ▼
┌────────────────────────────┐    ┌────────────────────────────────────────┐
│  角色卡服务 (Character Sheet)  │    │  DM 战役服务 (Campaign Service)         │
│  - 用户注册/登录/会话          │    │  - 战役 CRUD、邀请码、加入战役            │
│  - 会员（role / memberExpiresAt）│◄───│  - 遭遇、先攻、掷骰、事件流、SSE         │
│  - 角色 CRUD、角色数据         │    │  - 不存用户表，只存 userId（来自 JWT）     │
│  - 签发 JWT 供 DM 服务使用     │    │  - 需要角色信息时 → 调角色卡 API（带 JWT） │
│  - 提供 /api/auth/me 等       │    │  - 自有 DB：Campaign / Encounter / ...   │
│  数据库：User, Character, ... │    └────────────────────────────────────────┘
└────────────────────────────┘
```

| 能力           | 角色卡服务 | DM 战役服务 |
|----------------|------------|-------------|
| 用户注册/登录  | ✅         | ❌          |
| 会员校验       | ✅         | ❌（依赖 JWT 或角色卡 API） |
| 角色 CRUD/数据 | ✅         | ❌          |
| 战役/遭遇/先攻/骰子/事件 | ❌ | ✅         |
| 用户表/会话表  | ✅         | ❌          |

---

## 三、共享「用户与会员」的两种方案

### 方案 A：JWT（推荐）

- **角色卡**在用户登录后（或访问 `/api/auth/me` 时）签发 **JWT**，payload 含：`userId`、`email`、`role`、`memberExpiresAt`、`exp`。
- JWT 可通过以下方式交给前端，再由前端在访问 DM 服务时携带：
  - 响应头、或 `/api/auth/me` 的 body 里返回 `token` 字段；前端存内存或 localStorage，请求 DM 服务时带 `Authorization: Bearer <token>`。
  - 或角色卡 Set-Cookie 时额外写一份 `domain=.dimvision.xyz` 的 **仅含 JWT 的 cookie**（如 `dm_token`），DM 服务前端同域请求时自动带上，DM 后端从 cookie 或 Header 读 JWT。
- **DM 服务**：
  - 不连角色卡数据库，不存用户表。
  - 配置角色卡提供的 **JWT 公钥**（RS256）或 **共享密钥**（HS256）。
  - 每个请求校验 JWT，从中取 `userId`、`role`、`memberExpiresAt`，用于「仅会员可创建战役」等逻辑。
- **优点**：服务完全解耦、DM 可独立技术栈与部署；无共享 DB、无共享 Session 存储。
- **缺点**：角色卡需实现 JWT 签发与（若用 cookie）同域 cookie；JWT 过期需刷新（可依赖角色卡 `/api/auth/me` 或 refresh 接口）。

### 方案 B：同域 Cookie + 同一 Session 密钥

- 角色卡与 DM 部署在同一父域下（如 `cs.dimvision.xyz`、`dm.dimvision.xyz`），登录时 Set-Cookie 的 **domain 设为 `.dimvision.xyz`**，且两服务使用**相同的 SESSION_SECRET** 与 **cookie 名称**。
- 用户访问 DM 服务时，浏览器会把该 cookie 发给 DM 服务；DM 服务用 iron-session（或相同算法）解码 cookie 得到 `userId`、`tokenVersion` 等。
- **会员信息**：DM 服务不存 User，需向角色卡请求「当前用户是否会员」：例如前端在 DM 页加载时请求 `https://cs.dimvision.xyz/api/auth/me`（`credentials: 'include'`），角色卡返回 role、memberExpiresAt；或 DM 后端用**服务间密钥**调角色卡内部接口（如 `GET /api/internal/users/:id`）。
- **优点**：角色卡几乎不用改（仅登录时设置 cookie domain）；DM 服务若用 Node，可直接复用 session 解码逻辑。
- **缺点**：两服务必须共享 SESSION_SECRET；DM 需能调角色卡接口做会员校验或拿用户信息；与「完全独立技术栈」略有耦合。

**建议**：新做 DM 服务且希望技术栈自由、长期可拆，优先用 **方案 A（JWT）**；若短期希望改动最小，可用方案 B。

---

## 四、角色数据如何「联动」

- 所有**角色主数据**（名称、头像、先攻调整值、HP 等）始终只在**角色卡服务**。
- DM 服务只存「**谁用哪个角色参与哪个战役**」：即 `CampaignMember.userId` + `CampaignMember.characterId`（characterId 即角色卡中的 Character.id）。
- 需要展示或计算时，**由 DM 服务向后端请求角色卡**，例如：
  - **加入战役选角色**：DM 前端用当前用户 JWT 调 DM 后端「拉取我的角色列表」→ DM 后端用该 JWT 请求角色卡 `GET /api/characters`（或角色卡提供「供 DM 服务调用的」接口），把列表转给前端。
  - **先攻列表填充玩家**：DM 后端根据当前遭遇与战役成员，对每个 member 用其 `characterId` 请求角色卡 `GET /api/characters/:id`（需带该用户 JWT 或角色卡信任的 service-to-service 鉴权），拿到 name、avatar、先攻调整值等，与 NPC 条目合并后返回。
- 可选优化：DM 服务对「当前遭遇的玩家条目」做**短期缓存**（如 5 分钟），减少对角色卡 QPS，缓存失效时再调角色卡。

---

## 五、角色卡服务需新增/改造的接口

以下在**角色卡项目**中实现，供 DM 服务或前端使用。

| 用途           | 接口 | 说明 |
|----------------|------|------|
| 签发 JWT       | 登录或 GET /api/auth/me 时返回 JWT | payload: userId, email, role, memberExpiresAt, exp；建议 1～24h 过期，可加 refresh。 |
| 接受 JWT 鉴权  | GET /api/auth/me、GET /api/characters、GET /api/characters/:id | 请求头 `Authorization: Bearer <jwt>` 时，校验 JWT 并视为该用户，不再依赖 cookie。 |
| 供 DM 拉角色列表 | GET /api/characters | 已存在；需支持 JWT 鉴权（见上）。 |
| 供 DM 拉单角色详情 | GET /api/characters/:id | 已存在；需支持 JWT 鉴权，且校验该角色属于 JWT 对应用户（或 DM 服务用 service 密钥代查，见下）。 |

若采用 **DM 后端代拉角色**（避免把 JWT 交给 DM 前端再转给角色卡）：角色卡可提供**内部接口**，例如：

- `GET /api/internal/characters?userId=xxx` 或 `GET /api/internal/characters/:id`，用 **API Key** 或 **服务间 JWT** 鉴权，仅允许 DM 服务调用。此时 DM 前端只和 DM 后端通信，DM 后端持「角色卡 API Key」调角色卡拿数据。

---

## 六、DM 战役服务技术选型建议

- **与角色卡同栈（Next.js）**  
  - 优点：团队一致、SSE/API 路由现成、前后一体；角色卡若已用 Next，可复用 JWT 校验、请求角色卡的方式。  
  - 缺点：和角色卡同属一个技术生态。

- **独立栈（如 Node + Fastify/Express、Go、Python 等）**  
  - 优点：可按团队偏好选型、与角色卡完全解耦。  
  - 需要：自实现 JWT 校验、HTTP 调角色卡、SSE 推送、前端单独部署（或同一前端路由到不同后端）。

**推荐**：若希望「一个前端入口、一套部署习惯」，DM 服务用 **Next.js** 即可，与角色卡同栈但**不同仓库、不同部署、不同数据库**；仅通过 JWT 和 HTTP API 与角色卡协作。

---

## 七、数据与存储

- **角色卡服务**  
  - 现有库不变：User、Session、Character、VerificationCode、LoginLog、Admin、AdminAuditLog 等。  
  - 不新增战役相关表；仅新增 JWT 签发与对 JWT 的鉴权支持。

- **DM 战役服务**  
  - **独立数据库**（推荐）或与角色卡同实例**不同 schema**（如 `dm` schema）。  
  - 表仅包含：Campaign、CampaignMember（userId、characterId）、Encounter、InitiativeEntry、CampaignEvent 等；**无 User 表**，userId 为来自 JWT 的字符串。  
  - 若同库不同 schema：CampaignMember 的 userId、characterId 与角色卡库中的 User.id、Character.id 逻辑对应，但**不做外键**，避免跨服务强绑定。

---

## 八、部署与域名

- **角色卡**：例如 `https://cs.dimvision.xyz`（现有）。  
- **DM 战役**：例如 `https://dm.dimvision.xyz` 或 `https://campaign.dimvision.xyz`。  
- 两服务**同父域**（dimvision.xyz）便于：  
  - 方案 B 下共享 cookie；  
  - 方案 A 下若用 cookie 传 JWT，可设 `domain=.dimvision.xyz`。  

- **CORS**：  
  - 角色卡若被 DM 前端跨域请求（如 DM 前端直接调 `GET https://cs.dimvision.xyz/api/auth/me`），需对 `https://dm.dimvision.xyz` 开放 CORS，并支持 `credentials: true`（若用 cookie）。  
  - DM 服务仅被自家前端调用时，同域可不考虑 CORS。

- **部署**：两服务分别构建、分别部署（如阿里云上两个 Node 进程或两个容器），互不依赖同一代码库。

---

## 九、关键流程简图

### 9.1 用户打开 DM 工具（未登录）

1. 用户访问 `https://dm.dimvision.xyz`。  
2. DM 前端请求 DM 后端「当前用户」或直接请求受保护资源 → 无有效 JWT/cookie → 401。  
3. 前端跳转 `https://cs.dimvision.xyz/login?redirect=https://dm.dimvision.xyz`。  
4. 用户在角色卡完成登录；角色卡签发 JWT（或写 cookie），再重定向回 `https://dm.dimvision.xyz`（可选带 `?token=xxx` 或依赖 cookie）。  
5. DM 前端拿到 JWT 后，后续请求 DM 后端均带 `Authorization: Bearer <jwt>`；DM 后端校验 JWT，得到 userId、role、memberExpiresAt。

### 9.2 加入战役选角色

1. 用户在 DM 前端输入邀请码，DM 后端校验邀请码并返回战役信息。  
2. 用户点击「选择角色」→ DM 前端请求 DM 后端「我的角色列表」。  
3. DM 后端用当前请求中的 JWT 请求角色卡 `GET /api/characters`（或内部接口），得到该用户的角色列表，返回给前端。  
4. 用户选择一名角色；DM 前端请求 DM 后端「加入战役」body `{ inviteCode, characterId }`；DM 后端校验角色属于该用户后，写入 CampaignMember。

### 9.3 先攻列表展示玩家信息

1. DM 前端请求 DM 后端「当前遭遇先攻列表」。  
2. DM 后端查出 Encounter + InitiativeEntry；对 type=player 的条目，用其 characterId（及若需则 userId）向角色卡请求 `GET /api/characters/:id`（或内部接口），拿到 name、avatar、先攻调整值等，组装后返回；NPC 的 hp/ac/notes 按权限过滤（仅 DM 可见）。  
3. 前端展示完整先攻列表；当前回合高亮由事件流（SSE）或轮询更新。

---

## 十、安全与权限要点

- **JWT 密钥**：若用 HS256，仅角色卡与 DM 服务持有；若用 RS256，角色卡持私钥签发，DM 持公钥验证，私钥不出角色卡。  
- **会员校验**：DM 服务仅根据 JWT 中的 `role`、`memberExpiresAt` 判断「是否会员」；创建战役接口要求 `role === 'member'` 且未过期。  
- **跨服务调角色卡**：若用内部 API Key，仅 DM 后端持有，不暴露给前端；角色卡对内部接口做 IP 或 Key 校验。  
- **DM 身份**：仅 `Campaign.createdById === userId` 的用户可编辑/删除战役、管理遭遇与先攻等，与现有规划一致。

---

## 十一、实施顺序建议

1. **角色卡侧**  
   - 实现 JWT 签发（登录或 /api/auth/me 时）；  
   - GET /api/auth/me、GET /api/characters、GET /api/characters/:id 支持 `Authorization: Bearer <jwt>`；  
   - （可选）内部接口 + API Key，供 DM 后端拉角色。  

2. **DM 服务侧**  
   - 新建项目/仓库，选型（建议 Next.js）；  
   - 配置 JWT 校验中间件，从 JWT 取 userId、role、memberExpiresAt；  
   - 实现战役/遭遇/先攻等数据模型与 API；  
   - 需要角色信息时请求角色卡（带用户 JWT 或内部 Key）。  

3. **前端与部署**  
   - DM 前端：登录跳转角色卡、存 JWT、请求 DM 接口带 JWT；  
   - 角色卡登录后重定向回 DM 并传 token 或设 cookie；  
   - 两服务分别部署、配置域名与 CORS。

---

## 十二、与《DM工具功能头脑风暴与规划》的关系

- **业务功能与数据模型**（战役、遭遇、先攻、骰子、日志、权限等）仍按 **docs/DM工具功能头脑风暴与规划.md** 中的「五、六」执行。  
- **技术架构**以本文为准：  
  - 战役相关表与 API 落在 **DM 战役服务**；  
  - 用户与会员仅来自**角色卡**，通过 JWT（或同域 cookie）共享；  
  - 角色数据通过**调用角色卡 API** 联动，不在 DM 服务持久化角色主数据。

**任务编排与 Sub-Agent 验证**：分阶段实施计划及每阶段「Sub-Agent 检查与验证」的入口与标准见 **[DM工具分阶段任务与验证计划.md](./DM工具分阶段任务与验证计划.md)**。
