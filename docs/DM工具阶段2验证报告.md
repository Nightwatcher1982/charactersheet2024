# 阶段 2 Sub-Agent 验证报告（遭遇与先攻）

**执行时间**：按《DM工具分阶段任务与验证计划》4.2 进行 e2e 验证。

## 验证方式

- **e2e 脚本**：`node scripts/verify-phase2.mjs`（需角色卡 3000、DM 服务已启动，且 DM 已执行 `prisma migrate` + `prisma generate` 后启动）。
- **Lint**：`cd dm-campaign-service && npm run lint`。

## 验证结果

### 1. API 行为

| 验证项 | 结果 |
|--------|------|
| 非 DM 请求先攻列表时，NPC 条目无 notes、ac、hp（或为 null） | ✔ 通过 |
| 玩家 PATCH 自己 HP → 200 | ✔ 通过 |
| 玩家 PATCH 他人 HP → 403 | ✔ 通过 |
| DM PATCH 任意 HP → 200 | ✔ 通过 |
| POST next-turn 返回 200，且 currentTurnIndex 递增/正确 | ✔ 通过 |

### 2. Lint

- DM 服务：`npm run lint` ✔ 无 ESLint 报错。

### 3. e2e 脚本覆盖流程

脚本依次执行：

- 会员 / 玩家登录（角色卡 JWT）
- 创建战役、玩家加入战役
- 创建遭遇、设为当前遭遇
- 添加 NPC 条目（含 ac/hp/notes）、添加玩家条目
- GET 先攻列表（DM）→ 校验 NPC 含 ac/notes
- GET 先攻列表（玩家）→ 校验 NPC 的 notes、ac、hp 为 null
- 玩家 PATCH 自己 HP、玩家 PATCH 他人 HP（403）、DM PATCH NPC HP
- POST next-turn，再次 GET 先攻并校验 currentTurnIndex

**最近一次运行**：17 项通过，0 项失败。

## 运行说明

```bash
# 1. 确保测试用户存在（角色卡库）
npx ts-node scripts/create-test-users.ts

# 2. 启动角色卡（默认 3000）、DM 服务（默认 3001）
#    DM 服务目录需已执行：npx prisma migrate deploy && npx prisma generate

# 3. 在项目根目录执行
node scripts/verify-phase2.mjs

# 若 DM 使用其他端口：
DM_SERVICE_URL=http://localhost:3003 node scripts/verify-phase2.mjs
```

## 结论

阶段 2 的 Sub-Agent 验证（API 权限与先攻/回合、Lint、e2e 脚本）均已通过。
