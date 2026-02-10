# DM 工具功能集：头脑风暴、问题与规划

> - **技术架构**：DM 战役工具与角色卡为**两个独立服务**，用户与会员信息共享；角色数据通过 API 联动。详见 **[DM工具技术架构.md](./DM工具技术架构.md)**。  
> - **任务编排与验证**：分阶段任务及 Sub-Agent 检查项见 **[DM工具分阶段任务与验证计划.md](./DM工具分阶段任务与验证计划.md)**。

## 一、需求与当前项目对照

### 你的需求概览

| 功能 | 描述 |
|------|------|
| **1. 战役 (Campaign)** | DM 创建并保存战役，邀请玩家用「自己创建的角色」加入 |
| **2. 先攻顺序管理** | 类似 [dm.tools/tracker](https://dm.tools/tracker)：可管理先攻列表；战役内自动带出玩家角色（名称、头像、先攻调整值）、玩家掷先攻；DM 可添加怪物/NPC 并掷先攻 |
| **3. 3D 骰子** | 类似 [dm.tools/dice](https://dm.tools/dice)：在战役页面随时掷骰，DM 与玩家都能用 |

### 当前项目已具备

- **用户系统**：登录/注册、Session、User 表（含会员 role）
- **角色系统**：Character 归属 User，`data` 存完整角色 JSON；已有 **name、avatar、armorClass、currentHitPoints** 等
- **先攻相关**：先攻调整值 = 敏捷调整值（专长「警觉」时 + 熟练加值），在 `CharacterSheetSummary` / `BasicInfoPage` 中已有计算逻辑，可直接复用到先攻列表
- **无**：战役、邀请、实时同步、多人在线会话

### 与参考站点的差异（便于做规划）

- **dm.tools/tracker**：单机/本地使用为主，可登录保存遭遇；我们做的是「战役内多人」：玩家列表来自战役成员，先攻与掷骰需考虑多人看到同一状态。
- **dm.tools/dice**：独立骰子盘；我们做的是「战役页内嵌」：同一战役的人是否要看到同一颗骰子结果，需要你定。

---

## 二、需要你拍板的几个问题

下面这些会直接影响数据模型和实现方式，请你按偏好选或补充。

### 战役与邀请

1. **玩家如何加入战役？**
   - **A**：DM 生成「邀请链接」（带 token），玩家点链接登录后绑定自己的一个角色进入战役  
   - **B**：战役有「邀请码」（短码），玩家在「加入战役」页输入邀请码，再选一个自己的角色加入  
   - **C**：DM 输入玩家邮箱发起邀请，玩家在站内/邮件里收到邀请，接受时选角色加入  
   - 你更倾向哪种？是否要支持多种（例如既有链接也有邀请码）？

2. **一个玩家在一个战役里可以有几个角色？**  
   - 固定 **1 个角色/战役**（简单、先攻列表清晰）  
   - 还是允许 **多角色**（同一用户可切换不同角色参与同一战役）？

3. **战役的「生命周期」？**  
   - 仅「进行中 / 已结束」两种状态？  
   - 是否需要「归档」：不删数据，但不再允许加入或修改先攻？

### 先攻与遭遇

4. **先攻是「按遭遇」还是「按战役」？**  
   - **按遭遇 (Encounter)**：每场战斗是一个遭遇，有独立先攻列表；可「保存遭遇模板」「加载遭遇」、多场战斗之间切换。类似 dm.tools 的 "Unnamed encounter"、可命名、可保存。  
   - **按战役**：一个战役只有一个先攻列表，新战斗时清空重排。  
   - 建议：**按遭遇**，一个战役下可有多个遭遇，先攻列表归属当前选中的遭遇。你同意吗？

5. **怪物/NPC 需要存哪些信息？**  
   - **最少**：名称、先攻调整值（可选）、当前先攻值（掷骰结果）  
   - **扩展**：HP、AC、备注（方便 DM 记录）  
   - 是否需要在先攻表里直接编辑怪物 HP（如受伤减血）？若需要，就至少要有 HP 字段。

6. **先攻的「当前回合 / 轮次」是否要所有人同步？**  
   - 即：DM 点「下一回合」后，所有玩家的页面是否要**立刻**显示轮到谁？  
   - 若是，就需要**实时或准实时同步**（见下）。

### 骰子

7. **掷骰结果是否要所有人可见？**  
   - **方案 A**：所有人可见——任何人掷骰，同一战役内的所有人都看到同一次 3D 骰子与结果（需要同步）。  
   - **方案 B**：仅自己可见——每人自己掷、结果仅在自己页面显示（无需同步，实现简单）。  
   - **方案 C**：可选——掷骰时可选「公开」或「私密」，公开则同步给所有人，私密仅自己看（DM 私密 = 仅 DM 可见）。

8. **骰子类型是否固定 D&D 一套？**  
   - 当前项目是 D&D 2024 角色卡，默认 d4/d6/d8/d10/d12/d20/d100 即可？  
   - 是否需要「自定义公式」（如 2d6+3）或仅预设按钮？

### 权限与可见性

9. **谁算 DM？**  
   - 是否**仅「创建战役的人」= DM**？  
   - 是否需要「协管 DM」或「副 DM」（可管理先攻、不可删除战役）？

10. **玩家能看到什么？**  
    - 先攻列表：**仅自己一行** vs **完整列表（所有人+怪物）**？  
    - 建议：完整列表所有人可见，方便大家看回合顺序；若你希望玩家只看到自己，也可以做成「玩家视图只高亮自己」。

### 实时性与技术

11. **先攻顺序、当前回合、掷骰结果是否需要「实时」同步？**  
    - **实时**：DM 改先攻/点下一回合/掷骰，其他人几秒内看到（需 WebSocket 或 SSE 或短轮询）。  
    - **非实时**：大家自己刷新或进入页面时拉最新数据（实现简单，体验略差）。  
    - 你更倾向先做「刷新/轮询」再迭代实时，还是一开始就上 WebSocket/SSE？

### 会员与访问控制

12. **DM 工具是否仅会员可用？**  
    - 当前有 `requireMember()` 与会员体系但未接具体功能。  
    - 是否：**仅会员可创建战役** / **仅会员可加入战役** / 或**所有人可用**？

---

## 三、建议的规划（在您回答问题后可细调）

### 阶段 0：前提（可选）

- 若采用「邀请链接」：需要生成可撤销的 token（如 `CampaignInviteToken` 表）。  
- 若采用「邀请码」：战役生成短码（如 6 位），`Campaign.inviteCode` 唯一。

### 阶段 1：战役与成员（核心数据）

- **数据模型（建议）**  
  - `Campaign`：id, name, createdById (DM), status(active/ended/archived?), inviteCode?, createdAt, updatedAt  
  - `CampaignMember`：campaignId, userId, characterId（一个用户在一个战役里绑一个角色）, joinedAt  
  - 邀请：若用链接则增加 `CampaignInvite`（token, campaignId, expiresAt, usedAt）或类似  
- **API**  
  - DM：创建战役、编辑战役、生成邀请链接/邀请码、查看成员列表、移除成员（可选）  
  - 玩家：通过链接或邀请码加入、选择角色、离开战役（可选）  
- **前端**  
  - DM：战役列表、创建战役、战役详情（成员、邀请入口）  
  - 玩家：加入战役页（输入链接或邀请码）、我的战役列表、进入战役页

### 阶段 2：先攻顺序（遭遇 + 列表）

- **数据模型（建议）**  
  - `Encounter`：id, campaignId, name, sortOrder  
  - `InitiativeEntry`：encounterId, 类型(player|npc), 若 player 则 characterId + 可选 userId，若 npc 则 name/avatarUrl?/initiativeBonus/hp?/ac?/notes?, currentInitiative, orderIndex  
- **逻辑**  
  - 进入战役后，默认一个「当前遭遇」；DM 可新增/切换/删除遭遇。  
  - 先攻列表：从 `CampaignMember` + 当前遭遇的 `InitiativeEntry` 合并；玩家角色自动带出 name、avatar、先攻调整值（从 Character 的敏捷+警觉计算）。  
  - DM 可添加 NPC/怪物行（名称、先攻调整值、可选 HP/AC）、编辑、删除。  
  - 先攻掷骰：玩家为自己角色掷 d20+调整值；DM 为任意条目掷。排序按 currentInitiative 降序，同分可再按 orderIndex 或名称。  
- **「当前回合」**  
  - 在 Encounter 或单独表存 currentRound、currentTurnIndex；DM 点「下一回合」更新并通知前端（若做实时则推送，否则轮询/刷新）。

### 阶段 3：3D 骰子

- **前端**  
  - 战役页内嵌骰子区域：选择骰型（d4/d6/d8/d10/d12/d20/d100）、掷骰、3D 动画（可用 Three.js / 或现成库如 dice-box 等）。  
- **结果是否同步**  
  - 若选「所有人可见」或「公开/私密」：需要 `DiceRoll` 表（campaignId, userId, formula, result, isPrivate?, createdAt） + 推送或轮询，其他端展示同一次掷骰。  
  - 若仅自己可见：无需后端存储，仅前端动画+本地显示。

### 阶段 4（可选）：体验增强

- 实时同步：WebSocket 或 SSE，先攻变更、回合推进、公开掷骰推送给所有在场成员。  
- 遭遇模板：保存/加载遭遇（仅 NPC/怪物列表，不含先攻结果）。  
- 会员门控：创建/加入战役时 `requireMember()`。

---

## 四、下一步

请你：

1. **回答上面「二、需要你拍板的几个问题」**（按编号即可，例如：1-B，2-一个角色，4-按遭遇…）。  
2. **若有补充约束**（例如：必须支持手机端、不希望用 WebSocket 等）一并说明。  
3. **确认是否按「阶段 1 → 2 → 3」的顺序实施**，或希望调整顺序（例如先做骰子再做先攻）。

收到你的选择后，我会基于你的答案给出一份**更细的实施计划**（含表结构、API 列表、页面路由与任务拆分），并可直接开始阶段 1 的库表与接口设计。

---

## 五、已确认的产品决策（根据你的回复）

| 问题 | 你的选择 |
|------|----------|
| 1 邀请方式 | **邀请码 + 邀请链接** 两种；页面一键复制链接和邀请码；需「加入战役」页 |
| 2 角色数量 | 一个用户在一个战役中**只能选一个自己的角色** |
| 3 战役状态 | **进行中 / 已结束**；DM 可设置**下次开团时间**、有**开团日志**书写区域 |
| 4 先攻粒度 | **按遭遇**（一个战役多个遭遇，先攻属当前遭遇） |
| 5 怪物/NPC & HP | **扩展**：HP、AC、备注；**仅 DM 可见**。玩家 HP 可修改：**玩家改自己的，DM 改所有人的** |
| 6 回合同步 | **是**：点「下一回合」后**当前行动角色高亮**，所有人同步 |
| 7 骰子可见性 & 日志 | **所有人可见**；有**日志框**：文字版掷骰结果 + 先攻顺序总结 + 当前行动角色 + HP 扣减等 |
| 8 骰子公式 | **支持自定义公式**（如 2d6+3） |
| 9 DM 身份 | 战役**主页面**让用户选「DM / 玩家」；**仅 DM** 可管理（创建/删除/修改）；**仅创建者 = DM** |
| 10 玩家看先攻 | 玩家看**完整先攻列表** |
| 11 实时性 | **实时**同步 |
| 12 会员 | **仅会员可创建战役**；非会员可参与战役 |

---

## 六、详细实施计划

### 6.1 数据模型（Prisma）

```prisma
// 战役
model Campaign {
  id             String    @id @default(cuid())
  name           String
  createdById    String    // DM = User.id
  status         String    @default("active")   // active | ended
  nextSessionAt  DateTime? // 下次开团时间
  sessionLog     String?   @db.Text             // 开团日志（富文本或 Markdown）
  inviteCode     String    @unique               // 6 位邀请码，邀请链接 = /campaigns/join?code=xxx
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  createdBy   User              @relation(fields: [createdById], references: [id], onDelete: Cascade)
  members     CampaignMember[]
  encounters  Encounter[]
  events      CampaignEvent[]

  @@index([createdById])
  @@index([inviteCode])
}

// 战役成员（一用户一角色）
model CampaignMember {
  id          String   @id @default(cuid())
  campaignId  String
  userId      String
  characterId String   // 该用户在此战役中使用的角色
  joinedAt    DateTime @default(now())

  campaign  Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@unique([campaignId, userId])
  @@index([userId])
}

// 遭遇（一个战役下多个遭遇，先攻列表归属当前遭遇）
model Encounter {
  id                String   @id @default(cuid())
  campaignId        String
  name              String
  sortOrder         Int      @default(0)
  isActive          Boolean  @default(false)  // 当前选中的遭遇只有一个为 true
  currentRound      Int      @default(1)
  currentTurnIndex  Int      @default(0)     // 当前行动在排序后列表中的下标
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  campaign Campaign         @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  entries  InitiativeEntry[]

  @@index([campaignId])
}

// 先攻条目（玩家从角色带出，NPC 由 DM 填写；HP/AC/备注对 NPC 仅 DM 可见）
model InitiativeEntry {
  id               String   @id @default(cuid())
  encounterId      String
  type             String   // "player" | "npc"
  characterId      String?  // 玩家时关联角色
  userId           String?  // 玩家时关联用户（便于权限判断）
  name             String
  avatarUrl        String?
  initiativeBonus  Int      @default(0)
  currentInitiative Int?   // 掷骰结果，排序用
  hp               Int?    // 当前 HP（玩家可见可改自己，DM 可改全部；NPC 仅 DM 可见）
  maxHp            Int?
  ac               Int?    // NPC 时仅 DM 可见
  notes            String? @db.Text // 仅 DM 可见（NPC 用）
  orderIndex       Int     @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  encounter Encounter @relation(fields: [encounterId], references: [id], onDelete: Cascade)
  character Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)

  @@index([encounterId])
}

// 战役内事件流（掷骰、回合推进、HP 变更等，用于日志框 + 实时推送）
model CampaignEvent {
  id         String   @id @default(cuid())
  campaignId String
  type       String   // dice_roll | turn_advance | hp_change | encounter_ready 等
  payload    Json     // { userId, userName, formula, result, ... } 依 type 不同
  createdAt  DateTime @default(now())

  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId, createdAt])
}
```

- **User** 需增加 `campaignsCreated Campaign[]`、`campaignMembers CampaignMember[]`。
- **Character** 需增加 `campaignMembers CampaignMember[]`、`initiativeEntries InitiativeEntry[]`。

**邀请**：不单独建 Invite 表；邀请链接 = `{origin}/campaigns/join?code={campaign.inviteCode}`，邀请码即 `campaign.inviteCode`，创建战役时生成唯一 6 位码。

---

### 6.2 API 列表

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/campaigns | 创建战役 | 会员 requireMember |
| GET | /api/campaigns | 我创建的 + 我参与的战役列表 | 登录 |
| GET | /api/campaigns/[id] | 战役详情（含成员、当前遭遇、先攻列表） | 成员或 DM |
| PATCH | /api/campaigns/[id] | 编辑战役（名称、状态、下次开团时间、开团日志） | 仅 DM |
| DELETE | /api/campaigns/[id] | 删除战役 | 仅 DM |
| GET | /api/campaigns/[id]/events | 分页拉取事件（日志框历史） | 成员 |
| GET | /api/campaigns/[id]/events/stream | SSE 实时事件流 | 成员 |
| POST | /api/campaigns/join | 用邀请码加入，body: { inviteCode, characterId } | 登录 |
| GET | /api/campaigns/join/validate?code=xxx | 校验邀请码，返回战役名等（加入页用） | 可选 |
| — | — | **遭遇** | |
| POST | /api/campaigns/[id]/encounters | 创建遭遇 | DM |
| GET | /api/campaigns/[id]/encounters | 遭遇列表 | 成员 |
| PATCH | /api/campaigns/[id]/encounters/[eid] | 编辑遭遇；设 isActive=true 切换当前遭遇 | DM |
| DELETE | /api/campaigns/[id]/encounters/[eid] | 删除遭遇 | DM |
| — | — | **先攻** | |
| GET | /api/campaigns/[id]/encounters/[eid]/initiative | 先攻列表（玩家端过滤 NPC 的 hp/ac/notes） | 成员 |
| POST | /api/campaigns/[id]/encounters/[eid]/initiative | 添加 NPC 或「从成员填充玩家条目」 | DM |
| PATCH | /api/campaigns/[id]/encounters/[eid]/initiative/[entryId] | 更新条目（先攻值、HP、AC、备注等） | DM 或本人改自己 HP |
| DELETE | /api/campaigns/[id]/encounters/[eid]/initiative/[entryId] | 删除条目 | DM |
| POST | /api/campaigns/[id]/encounters/[eid]/initiative/roll | 掷先攻（为某条目掷 d20+bonus） | DM 或本人为自己掷 |
| POST | /api/campaigns/[id]/encounters/[eid]/next-turn | 下一回合（currentTurnIndex/currentRound 更新 + 写事件 + 推送） | DM |
| — | — | **骰子** | |
| POST | /api/campaigns/[id]/dice | 掷骰，body: { formula: "2d6+3" }；写 CampaignEvent + 推送 | 成员 |

- 先攻列表返回时：若当前用户非 DM，对 `type=npc` 的条目不返回 `notes`、`ac`、`hp`（或返回 null）；对 `type=player` 的 HP 所有人可见。

---

### 6.3 前端路由与页面

| 路由 | 说明 |
|------|------|
| /campaigns | 战役首页：选择「以 DM 身份」/「以玩家身份」；DM 可见创建按钮（会员）、我的战役列表；玩家可见我的战役、加入战役入口 |
| /campaigns/new | 创建战役（仅会员，表单：名称等） |
| /campaigns/join | 加入战役：输入邀请码或从链接带 ?code=xxx 预填；校验后选一个自己的角色加入 |
| /campaigns/[id] | 战役主厅：Tab 或区块 = 先攻表 + 骰子 + 日志框 +（DM）开团日志/下次开团时间/遭遇管理 |
| /campaigns/[id]/settings | DM 专用：编辑战役信息、邀请码与邀请链接（一键复制）、成员列表、下次开团、开团日志 |

- 战役主厅：顶部或侧边「当前遭遇」选择器；先攻表按 currentInitiative 排序，当前回合高亮；骰子区支持预设 d4/d6/…/d100 + 自定义公式输入；日志框消费 SSE + 历史 GET，展示事件（掷骰、回合、HP 变更等）。

---

### 6.4 实时同步方案

- **方式**：SSE（Server-Sent Events），GET `/api/campaigns/[id]/events/stream`，保持长连接，服务端在写 `CampaignEvent` 后向该战役所有订阅连接广播一条 event。
- **服务端**：单机内存维护 `Map<campaignId, Set<Response>>`，在「掷骰 / 下一回合 / HP 变更」等 API 中写入 DB 后遍历该 Set 写 SSE 数据；若后续多实例部署可改为 Redis Pub/Sub + 各实例订阅同一 channel 再推给本地连接。
- **事件内容**：与 `CampaignEvent` 一致（type + payload），前端根据 type 更新 UI（先攻高亮、日志框追加、3D 骰子动画触发等）。

---

### 6.5 骰子公式解析

- 支持形式：`AdB+C`、`AdB-C`、`d20`、`2d6+3` 等；A=骰数，B=面数，C=加减常数。
- 后端校验与执行：解析后 roll A 次 B 面骰，加总 + C，写入 `CampaignEvent`（type=dice_roll，payload 含 formula、各骰结果、总和、userId/userName），并推送 SSE。
- 前端 3D：可选用现成库（如基于 Three.js 的 dice-box 或类似），收到事件后播放对应骰型动画并显示结果。

---

### 6.6 任务拆分（建议实施顺序）

**阶段 1：战役与成员**

1. Prisma：Campaign、CampaignMember，User/Character 关联；生成并执行 migration。
2. 邀请码：创建战役时生成 6 位唯一 inviteCode（可查重重试）。
3. API：POST/GET/PATCH/DELETE campaigns、POST join、GET join/validate（可选）。
4. 权限：创建战役 requireMember；PATCH/DELETE 仅 createdById；加入仅登录。
5. 页面：/campaigns（身份选择、列表、创建入口）、/campaigns/new、/campaigns/join（带 code 预填、选角色）、/campaigns/[id] 占位、/campaigns/[id]/settings（DM：名称、状态、下次开团、开团日志、邀请码与链接一键复制）。

**阶段 2：遭遇与先攻**

6. Prisma：Encounter、InitiativeEntry，与 Campaign/Character 关联；migration。
7. API：encounters CRUD、initiative CRUD、roll initiative、next-turn；返回先攻时按「是否 DM」过滤 NPC 的 hp/ac/notes。
8. 先攻逻辑：从成员与角色计算先攻调整值（复用现有敏捷+警觉）；排序按 currentInitiative 降序；next-turn 更新 currentTurnIndex/currentRound 并写入 CampaignEvent。
9. 页面：战役主厅先攻区块（列表、高亮当前、DM 可添加 NPC/掷骰/下一回合）；玩家可掷自己先攻、改自己 HP；遭遇选择器与遭遇管理（DM）。

**阶段 3：事件流与日志框**

10. Prisma：CampaignEvent；migration。
11. API：GET events 分页、GET events/stream（SSE）；在 dice、next-turn、hp_change 等处写事件并广播。
12. 内存广播器：维护 campaignId -> Set<Response>，在相关 API 中 push 事件。
13. 页面：战役主厅「日志框」组件，订阅 SSE + 拉取历史，渲染文字版掷骰、先攻总结、当前行动、HP 变更等。

**阶段 4：骰子与 3D**

14. 骰子公式解析（后端）：解析 AdB±C，执行 roll，写 CampaignEvent + 推送。
15. API：POST /api/campaigns/[id]/dice。
16. 前端：战役主厅骰子区，预设按钮 + 自定义公式输入，调用 API 后由 SSE 收到结果，触发 3D 动画（可选库）并更新日志框。

**阶段 5：体验收尾**

17. 开团日志与下次开团时间：在 settings 或战役主厅 DM 区展示/编辑，已含在 PATCH campaign 与数据模型中。
18. 离开战役：DELETE /api/campaigns/[id]/members/me 或 PATCH 移除成员（可选）。
19. 会员门控：创建战役按钮/路由内 requireMember，非会员提示「仅会员可创建战役」。

---

## 七、下一步

可按「阶段 1」开始落地：先做 Prisma 模型与 migration，再实现战役 CRUD、邀请码与加入接口，最后做 /campaigns、/campaigns/join、/campaigns/[id]/settings 等页面。需要我从阶段 1 的 Prisma schema 与第一个 API 开始写代码吗？
