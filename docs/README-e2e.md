# 角色创建 E2E 自动化测试

从**用户登录**到**角色卡生成**的端到端测试，用于在增加新功能后快速回归检查。

## 前置条件

1. **开发服务器已启动**
   ```bash
   npm run dev
   ```
   默认地址：`http://localhost:3000`。若使用其他端口，设置环境变量：
   ```bash
   PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
   ```

2. **测试账号**
   - 在 `.env` 或运行测试时设置：
     - `E2E_TEST_EMAIL`：已注册的邮箱
     - `E2E_TEST_PASSWORD`：该账号密码
   - 若未设置，测试会自动跳过（`test.skip()`）。

## 安装 Playwright 浏览器（首次运行，必须）

安装依赖后需下载浏览器，否则会报 `Executable doesn't exist`：

```bash
npx playwright install chromium
```

## 运行测试

```bash
# 运行全部 E2E 测试
npm run test:e2e

# 指定用例
npx playwright test e2e/create-character.spec.ts

# 带 UI 调试
npm run test:e2e:ui

# 指定 baseURL
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

## 测试流程概要

1. **登录**：访问 `/login`，填写邮箱/密码，提交，等待跳转首页。
2. **进入创建**：首页点击「创建新角色」，进入 `/create`。
3. **创建向导**：
   - 欢迎 → 开始创建
   - 职业：选择「战士」→ 技能（运动、察觉）→ 装备选项 A → 战斗风格（防御）
   - 起源：物种「矮人」→ 背景「侍僧」→ 属性加值 → 语言
   - 属性值（标准数组）→ 阵营（中立善良）→ 技能检查 → 装备检查 → 法术检查
   - 传记 → **完成角色创建**
4. **角色卡校验**：跳转到 `/characters/[id]/character-sheet`，检查：
   - 页面标题/未命名角色
   - 标签：基础、特性、装备、法术、传记
   - 文案中出现：战士、矮人、侍僧

## 修改与维护

- 选择器：优先使用 `getByRole`、`getByText`；若 UI 文案或结构变更，需同步修改 `e2e/create-character.spec.ts`。
- 新增步骤：若创建流程增加步骤（如新一步或新弹窗），在测试中补上对应操作与断言。
- 报告：失败时默认会生成 `playwright-report/`、`test-results/`（截图、录像、trace），便于排查。

## 可选：.env.example 说明

在 `.env.example` 中可增加（不要写真实密码）：

```bash
# E2E 测试账号（可选，未设置时 E2E 测试会跳过）
# E2E_TEST_EMAIL="your-test@example.com"
# E2E_TEST_PASSWORD="your-test-password"
```

本地复制为 `.env` 后填入真实测试账号即可跑 E2E。
