# DM 工具 - 分阶段任务编排与 Sub-Agent 验证计划

本文档在 **需求与产品设计**（[DM工具功能头脑风暴与规划.md](./DM工具功能头脑风暴与规划.md)）和 **技术架构**（[DM工具技术架构.md](./DM工具技术架构.md)）基础上，将工作拆成可执行阶段，并为每阶段约定 **Sub-Agent 检查与验证** 的入口与标准。

---

## 一、阶段总览

| 阶段 | 名称 | 产出概要 | Sub-Agent 验证重点 |
|------|------|----------|--------------------|
| **0** | 跨服务认证与 DM 骨架 | 角色卡 JWT 签发与鉴权；DM 服务新建、JWT 校验 | Lint、现有 e2e 不坏、JWT 校验通过 |
| **1** | 战役与成员 | Campaign/Member API、邀请码、加入战役、基础页面 | Lint、API 契约、关键路径 |
| **2** | 遭遇与先攻 | Encounter/Initiative API、先攻列表、调角色卡 | Lint、权限与可见性、先攻排序 |
| **3** | 事件流与日志框 | CampaignEvent、SSE、广播器、日志框 UI | Lint、SSE 连接与推送 |
| **4** | 骰子与 3D | 公式解析、dice API、前端骰子区 | Lint、公式单测、dice API |
| **5** | 体验收尾与上线 | 开团日志、离开战役、会员门控、CORS、部署 | 全量 e2e、代码审查清单 |

---

## 二、阶段 0：跨服务认证与 DM 服务骨架

**目标**：角色卡支持 JWT 签发与 Bearer 鉴权；DM 服务可独立运行并校验 JWT，不依赖角色卡 DB。

### 2.1 角色卡服务（本仓库）

| 序号 | 任务 | 说明 |
|------|------|------|
| 0.1.1 | JWT 签发工具 | 新增 `lib/jwt.ts`：HS256 签发，payload 含 `userId`、`email`、`role`、`memberExpiresAt`、`exp`（如 24h）；密钥来自 `env JWT_SECRET`。 |
| 0.1.2 | 登录成功时返回 JWT | 在 `POST /api/auth/login` 成功响应 body 中增加 `token` 字段（或单独 `/api/auth/token` 由前端在 /me 后调）。 |
| 0.1.3 | /api/auth/me 支持 Bearer 并返回 token | 请求头 `Authorization: Bearer <jwt>` 时，校验 JWT 并返回用户信息；同时响应 body 中可带 `token`（新签发或原样）供前端存。若仅 cookie 请求则保持现有逻辑。 |
| 0.1.4 | /api/characters 支持 Bearer | 从 `Authorization: Bearer <jwt>` 解析 userId，校验通过后按该用户返回角色列表；与现有 cookie session 逻辑二选一或并存。 |
| 0.1.5 | /api/characters/[id] 支持 Bearer | 同上，且校验该 character 属于 JWT 对应用户。 |
| 0.1.6 | .env.example 与文档 | 增加 `JWT_SECRET` 说明；在《DM工具技术架构》或本计划中注明「角色卡已支持 JWT」。 |

### 2.2 DM 战役服务（新仓库/新目录）

| 序号 | 任务 | 说明 |
|------|------|------|
| 0.2.1 | 初始化项目 | 新建 Next.js 项目（或独立 Node 服务），与角色卡同栈便于复用类型；配置 TS、ESLint。 |
| 0.2.2 | JWT 校验中间件/工具 | 从 `Authorization: Bearer <token>` 或约定 cookie 取 JWT，用与角色卡一致的密钥验证，得到 `userId`、`role`、`memberExpiresAt`；未登录返回 401。 |
| 0.2.3 | 环境与配置 | `JWT_SECRET` 与角色卡一致；`CHARACTER_SHEET_API_URL`（角色卡 base URL）用于后续调 /api/characters 等。 |
| 0.2.4 | 健康检查 | `GET /api/health` 或 `/` 返回 200，便于部署检查。 |

### 2.3 Sub-Agent 验证（阶段 0）

**触发条件**：阶段 0 所有任务完成或该阶段 PR 合并前。

**检查项**（由 Sub-Agent 执行或人工按清单执行）：

1. **角色卡仓库**
   - `npm run lint` 通过。
   - 现有 e2e 全通过：`npm run test:e2e`（若有）。
   - 手动或脚本：`GET /api/auth/me` 带 `Authorization: Bearer <合法 JWT>` 返回 200 且含 user；带无效/过期 JWT 返回 401。
   - 手动或脚本：`GET /api/characters` 带同一合法 JWT 返回该用户角色列表。

2. **DM 服务仓库**
   - `npm run lint` 通过。
   - 使用与角色卡相同的 JWT 调用 DM 某个「需登录」的占位接口（如 `GET /api/campaigns`），返回 200（空列表）或 401（未带 token 时）。

**输出**：验证报告（通过/不通过 + 命令输出或截图），附在阶段 0 完成说明中。

**自动化脚本**：在角色卡项目根目录执行 `node scripts/verify-phase0.mjs`（需已配置 `E2E_TEST_EMAIL`、`E2E_TEST_PASSWORD`，且角色卡与 DM 服务已启动；DM 默认 `http://localhost:3001`，可通过 `DM_SERVICE_URL` 覆盖）。

---

## 三、阶段 1：战役与成员

**目标**：DM 服务提供战役 CRUD、邀请码、加入战役；前端有战役列表、创建、加入、设置页。

### 3.1 DM 战役服务

| 序号 | 任务 | 说明 |
|------|------|------|
| 1.1.1 | 数据模型 | Prisma：Campaign（name, createdById, status, nextSessionAt, sessionLog, inviteCode）、CampaignMember（campaignId, userId, characterId）；无 User 表。 |
| 1.1.2 | 邀请码 | 创建战役时生成 6 位唯一 inviteCode（字母数字），冲突则重试；邀请链接 = `{DM 前端 origin}/campaigns/join?code=xxx`。 |
| 1.1.3 | API：POST /api/campaigns | 创建战役；鉴权：JWT 且 requireMember（role===member 且 memberExpiresAt 未过期）；body：name 等。 |
| 1.1.4 | API：GET /api/campaigns | 我创建的 + 我参与的战役列表；鉴权：JWT。 |
| 1.1.5 | API：GET /api/campaigns/[id] | 战役详情；鉴权：仅成员或 DM 可访问。 |
| 1.1.6 | API：PATCH /api/campaigns/[id] | 编辑战役；鉴权：仅 createdById。 |
| 1.1.7 | API：DELETE /api/campaigns/[id] | 删除战役；鉴权：仅 createdById。 |
| 1.1.8 | API：POST /api/campaigns/join | body: { inviteCode, characterId }；校验邀请码、角色属于当前用户（调角色卡 GET /api/characters 或 /api/characters/:id 校验）；写入 CampaignMember。 |
| 1.1.9 | API：GET /api/campaigns/join/validate?code=xxx | 校验邀请码有效则返回战役名等，供加入页展示。 |
| 1.2.1 | 页面：/campaigns | 战役首页；选择「以 DM 身份」/「以玩家身份」；列表；创建入口（会员）；加入战役入口。 |
| 1.2.2 | 页面：/campaigns/new | 创建战役表单（名称等）。 |
| 1.2.3 | 页面：/campaigns/join | 支持 ?code= 预填；输入邀请码、选角色（调 DM 后端「我的角色」→ 后端用 JWT 调角色卡 /api/characters）、提交加入。 |
| 1.2.4 | 页面：/campaigns/[id] | 战役主厅占位（可仅标题 + 成员列表）。 |
| 1.2.5 | 页面：/campaigns/[id]/settings | DM 专用：编辑名称/状态、下次开团时间、开团日志、邀请码与邀请链接一键复制。 |

### 3.2 Sub-Agent 验证（阶段 1）

1. **DM 服务**
   - `npm run lint` 通过。
   - 创建战役：带会员 JWT POST /api/campaigns → 201，返回 inviteCode；非会员 → 403。
   - 加入战役：带 JWT POST /api/campaigns/join { inviteCode, characterId } → 200；GET /api/campaigns 包含该战役。
   - 权限：非 DM 用户 PATCH /api/campaigns/[id] → 403。
2. **前端**
   - 关键路径：未登录访问 /campaigns 跳转登录或提示；登录后可见列表；创建→出现新战役；加入→选角色后出现在「我的战役」。
3. **可选**：为 DM 服务添加 1～2 条 e2e（Playwright）覆盖「登录后创建战役」或「加入战役」。

**输出**：验证报告（通过/不通过），可附 API 请求示例或 e2e 结果。

---

## 四、阶段 2：遭遇与先攻

**目标**：遭遇 CRUD、先攻列表、玩家从角色卡带出、NPC 由 DM 添加、掷先攻、下一回合；玩家可改自己 HP，DM 可改全部；NPC 的 hp/ac/notes 仅 DM 可见。

### 4.1 DM 战役服务

| 序号 | 任务 | 说明 |
|------|------|------|
| 2.1.1 | 数据模型 | Encounter（campaignId, name, sortOrder, isActive, currentRound, currentTurnIndex）；InitiativeEntry（encounterId, type, characterId, userId, name, avatarUrl, initiativeBonus, currentInitiative, hp, maxHp, ac, notes, orderIndex）。 |
| 2.1.2 | API：Encounter CRUD | POST/GET/PATCH/DELETE /api/campaigns/[id]/encounters；PATCH 可设 isActive 切换当前遭遇。 |
| 2.1.3 | API：先攻列表 | GET /api/campaigns/[id]/encounters/[eid]/initiative；对非 DM 过滤 NPC 的 notes、ac、hp；玩家条目可从角色卡 GET /api/characters/:id 拉取 name/avatar/先攻调整值（或后端代理请求）。 |
| 2.1.4 | API：添加先攻条目 | POST 添加 NPC（DM）或「从成员填充玩家」（DM）；玩家条目可关联 characterId，后端调角色卡补全展示用字段。 |
| 2.1.5 | API：更新/删除条目 | PATCH/DELETE initiative/[entryId]；HP 修改：玩家只能改自己，DM 可改所有；写 CampaignEvent type=hp_change（阶段 3 建表后可做）。 |
| 2.1.6 | API：掷先攻 | POST initiative/roll，为某 entry 掷 d20+bonus，更新 currentInitiative，排序。 |
| 2.1.7 | API：下一回合 | POST next-turn；更新 currentTurnIndex/currentRound；写入 CampaignEvent（阶段 3 统一做）。 |
| 2.2.1 | 页面：战役主厅先攻区块 | 当前遭遇选择器；先攻表（排序、高亮当前回合）；DM：添加 NPC、掷骰、下一回合；玩家：掷自己先攻、改自己 HP。 |
| 2.2.2 | 先攻调整值计算 | 调角色卡拿角色 data，从中计算敏捷调整值+警觉专长（与角色卡逻辑一致），或角色卡提供轻量接口返回 initiativeBonus。 |

### 4.2 Sub-Agent 验证（阶段 2）

1. **API**
   - 非 DM 请求先攻列表时，NPC 条目无 notes、ac、hp（或为 null）。
   - 玩家 PATCH 他人 HP → 403；DM PATCH 任意 HP → 200。
   - next-turn 后 currentTurnIndex 递增，列表顺序与高亮一致。
2. **Lint**：DM 服务与涉及到的角色卡改动均通过 lint。
3. **可选**：先攻排序与当前回合的单元测试或 e2e 一步。

**输出**：验证报告。

---

## 五、阶段 3：事件流与日志框

**目标**：CampaignEvent 表、SSE 流、写入事件并广播；战役主厅「日志框」展示掷骰、回合、HP 变更等。

### 5.1 DM 战役服务

| 序号 | 任务 | 说明 |
|------|------|------|
| 3.1.1 | 数据模型 | CampaignEvent（campaignId, type, payload, createdAt）；type: dice_roll | turn_advance | hp_change | encounter_ready 等。 |
| 3.1.2 | 内存广播器 | 单机 Map<campaignId, Set<Response>>；SSE 连接注册/注销；在写事件处遍历 Set 推送 event。 |
| 3.1.3 | API：GET events 分页 | GET /api/campaigns/[id]/events?cursor=&limit= 拉历史。 |
| 3.1.4 | API：GET events/stream | SSE；连接时加入 Map；断开时移除；其他 API 写 CampaignEvent 后向该 campaignId 的 Set 写 SSE 数据。 |
| 3.1.5 | 在 next-turn、hp_change 等处写事件 | 写入 CampaignEvent 并调用广播器；阶段 2 的 next-turn、HP PATCH 已存在，此处增加写事件+推送。 |
| 3.2.1 | 页面：日志框组件 | 战役主厅内；订阅 SSE；首次加载拉历史 GET events；渲染文字：掷骰、先攻总结、当前行动、HP 变更等。 |

### 5.2 Sub-Agent 验证（阶段 3）

1. **SSE**：打开 events/stream，在另一请求中触发 next-turn 或 hp_change，SSE 端应收到对应 event。
2. **Lint**：通过。
3. **日志框**：手动或 e2e：推进回合后日志框出现「当前到 XX 行动」；HP 变更后出现扣减信息。

**输出**：验证报告。

---

## 六、阶段 4：骰子与 3D

**目标**：自定义公式解析（AdB±C）、POST dice、写事件并推送；前端骰子区与 3D 展示。

### 6.1 DM 战役服务

| 序号 | 任务 | 说明 |
|------|------|------|
| 4.1.1 | 公式解析与掷骰 | 解析 2d6+3、d20 等；roll 后写 CampaignEvent type=dice_roll，payload 含 formula、各骰结果、总和、userId/userName；调用广播器推送。 |
| 4.1.2 | API：POST /api/campaigns/[id]/dice | body: { formula }；鉴权：战役成员；返回本次结果；内部写事件+推送。 |
| 4.2.1 | 前端骰子区 | 预设 d4/d6/d8/d10/d12/d20/d100；自定义公式输入；调用 dice API；收到 SSE 后更新日志框并可触发 3D 动画（可选库）。 |

### 6.2 Sub-Agent 验证（阶段 4）

1. **公式解析**：单元测试覆盖 d20、2d6+3、1d4-1 等；非法公式返回 400。
2. **API**：POST dice 返回 result；SSE 收到 dice_roll 事件且 payload 一致。
3. **Lint**：通过。

**输出**：验证报告 + 公式解析单测结果。

---

## 七、阶段 5：体验收尾与上线

**目标**：开团日志与下次开团时间展示/编辑、离开战役、会员门控提示、CORS、部署与文档。

### 7.1 任务

| 序号 | 任务 | 说明 |
|------|------|------|
| 5.1.1 | 开团日志与下次开团 | 已在 PATCH campaign 与数据模型中；确保 settings 与主厅 DM 区可编辑与展示。 |
| 5.1.2 | 离开战役 | DELETE /api/campaigns/[id]/members/me 或 PATCH 移除当前用户；前端「离开战役」按钮。 |
| 5.1.3 | 会员门控 | 创建战役入口：非会员点击提示「仅会员可创建战役」或跳转会员说明；后端已 requireMember。 |
| 5.1.4 | CORS | 角色卡对 DM 前端域名开放 CORS（若 DM 前端直调角色卡）；credentials 按需。 |
| 5.1.5 | 部署与文档 | DM 服务部署到独立域名（如 dm.dimvision.xyz）；环境变量清单；《DM工具技术架构》中补充实际域名与验证方式。 |

### 7.2 Sub-Agent 验证（阶段 5）

1. **全量 e2e**（建议）
   - 角色卡：登录 → /api/auth/me 带 JWT → 获取 token；/api/characters 带 JWT 返回列表。
   - DM：带 JWT 访问 /campaigns → 创建战役（会员）→ 复制邀请码 → 加入战役（另一用户或同用户另一角色）→ 主厅见先攻占位/日志框/骰子区 → 掷骰 → 下一回合 → 日志框更新。
2. **代码审查清单**（Sub-Agent 或人工按清单勾选）
   - 角色卡：JWT_SECRET 仅服务端、未打入前端；/api/characters 在 Bearer 下仅返回当前用户角色。
   - DM：未存用户密码或角色卡 session；邀请码不可预测（足够随机）；SSE 连接在断开时从 Map 移除，无泄漏。
3. **Lint**：两仓库均 `npm run lint` 通过。

**输出**：e2e 报告 + 审查清单勾选结果 + 部署验证（访问 DM 域名、登录跳转角色卡、创建/加入战役可完成）。

---

## 八、Sub-Agent 使用方式建议

- **每阶段结束时**：运行「该阶段验证」中的命令（lint、单测、e2e），并生成简短报告（通过/失败 + 命令输出或链接）。
- **代码审查清单**：可在阶段 5 或每个 PR 中由 Sub-Agent 按清单逐条检查并输出是否满足。
- **触发方式**：在 PR 描述或 commit 中注明「Phase N verification」或使用 Cursor/CI 的 agent 指令，例如：
  - “请按 docs/DM工具分阶段任务与验证计划.md 阶段 N 的 Sub-Agent 验证项执行 lint、测试与清单检查，并输出验证报告。”

---

## 九、文档与需求引用

- 需求与数据模型细节：[DM工具功能头脑风暴与规划.md](./DM工具功能头脑风暴与规划.md)
- 技术架构与接口分工：[DM工具技术架构.md](./DM工具技术架构.md)
- 本文：分阶段任务与 Sub-Agent 验证计划，随实现进展可勾选任务状态并附验证报告链接。
