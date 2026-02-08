/**
 * 角色创建 E2E 测试：从登录到角色卡生成与内容校验
 *
 * 前置条件：
 * 1. 开发服务器已启动：npm run dev（默认 http://localhost:3000）
 * 2. 环境变量：E2E_TEST_EMAIL、E2E_TEST_PASSWORD（已注册的测试账号）
 *
 * 运行：npx playwright test e2e/create-character.spec.ts
 * 或：npm run test:e2e
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;

test.describe('角色创建全流程', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      test.skip();
      return;
    }
  });

  test('登录 -> 创建角色（战士+矮人+侍僧）-> 角色卡内容校验', async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) return;

    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

    // ---------- 1. 登录 ----------
    await page.goto(`${baseURL}/login`);
    await expect(page.getByRole('heading', { name: /邮箱登录|登录/ })).toBeVisible({ timeout: 10000 });

    await page.locator('#login-email').fill(TEST_EMAIL);
    await page.locator('#login-password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: '登录' }).click();

    // 应跳转到首页（或显示创建新角色入口）
    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // ---------- 2. 进入创建页 ----------
    await page.getByRole('button', { name: /创建新角色/ }).click();
    await expect(page).toHaveURL(/\/create/);
    // 欢迎步为自定义 UI，显示「开始创建」按钮（非 StepWelcome 的「创建你的 D&D 角色」）
    await expect(page.getByRole('button', { name: '开始创建' })).toBeVisible({ timeout: 10000 });

    // ---------- 3. 欢迎步骤 ----------
    await page.getByRole('button', { name: '开始创建' }).click();
    await page.waitForTimeout(500);

    // ---------- 4. 选择职业：战士 ----------
    await page.getByRole('button', { name: /战士/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '下一步' }).click();

    // 技能选择弹窗：选 2 项（运动、察觉）
    await expect(page.getByText(/职业技能选择|选择.*项技能/)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '运动' }).click();
    await page.getByRole('button', { name: '察觉' }).click();
    await page.getByRole('button', { name: '确认选择' }).click();
    await page.waitForTimeout(500);

    // 装备选择弹窗：选项 A
    const equipmentConfirm = page.getByRole('button', { name: '确认选择' });
    if (await page.getByText('选项A').first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: /选项A/ }).first().click();
      await equipmentConfirm.click();
      await page.waitForTimeout(500);
    }

    // 职业特性：战斗风格（选 防御）
    if (await page.getByText(/战斗风格|Fighting Style/).isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: /防御|Defense/ }).first().click();
      await page.getByRole('button', { name: '确认选择' }).click();
      await page.waitForTimeout(500);
    }

    // ---------- 5. 起源：物种 矮人（无子项选择） ----------
    await page.getByRole('button', { name: /矮人/ }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // 起源：背景 侍僧
    await expect(page.getByText(/背景|确定起源/)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /侍僧/ }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // 背景装备（若有弹窗）
    if (await page.getByText(/装备选项|选择装备/).isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: '确认选择' }).first().click();
      await page.waitForTimeout(300);
    }

    // 属性加值：2+1 或 1+1+1（点选到满 3 点）
    const abilityBonus = page.getByText(/属性加值|分配.*加值/);
    if (await abilityBonus.isVisible({ timeout: 5000 }).catch(() => false)) {
      // 常见：力量+2、敏捷+1（或任意 3 点）
      const plusButtons = page.locator('button:has-text("+")');
      const count = await plusButtons.count();
      for (let i = 0; i < Math.min(3, count); i++) {
        await plusButtons.nth(i).click();
        await page.waitForTimeout(100);
      }
      const confirmBonus = page.getByRole('button', { name: /确认|完成/ });
      if (await confirmBonus.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmBonus.click();
      }
      await page.waitForTimeout(300);
    }

    // 语言：选满 2 项（通用语已含，再选 2 个）
    const langSection = page.getByText(/已选择.*\/.*2|语言/);
    if (await langSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      const langButtons = page.locator('button').filter({ hasNotText: '确认' }).filter({ hasNotText: '下一步' }).filter({ hasNotText: '随机' });
      const firstLang = page.getByRole('button', { name: /精灵语|矮人语|侏儒语|兽人语|龙语|通用语/ }).first();
      if (await firstLang.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstLang.click();
        await page.waitForTimeout(200);
      }
      const secondLang = page.getByRole('button', { name: /矮人语|侏儒语|兽人语|龙语|半身人语/ }).first();
      if (await secondLang.isVisible({ timeout: 2000 }).catch(() => false)) {
        await secondLang.click();
      }
      await page.waitForTimeout(300);
    }

    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // ---------- 6. 属性值（标准数组默认） ----------
    await expect(page.getByText(/确定属性值|属性值/)).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // ---------- 7. 阵营 ----------
    await page.getByRole('button', { name: /中立善良|守序善良/ }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // ---------- 8. 技能检查 ----------
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // ---------- 9. 装备检查 ----------
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // ---------- 10. 法术检查（战士无法术） ----------
    await page.getByRole('button', { name: '下一步' }).click();
    await page.waitForTimeout(500);

    // ---------- 11. 传记 -> 完成 ----------
    await page.getByRole('button', { name: '完成角色创建' }).click();

    // ---------- 12. 应跳转到角色卡 ----------
    await expect(page).toHaveURL(/\/characters\/[^/]+\/character-sheet/, { timeout: 20000 });
    await page.waitForTimeout(2000);

    // ---------- 13. 角色卡内容校验 ----------
    // 标题区：角色名或「未命名角色」
    await expect(
      page.getByRole('heading', { name: /未命名角色|.+/ }).first()
    ).toBeVisible({ timeout: 5000 });

    // 应有基础 / 特性 / 装备 / 法术 / 传记 等标签
    await expect(page.getByRole('button', { name: '基础' }).or(page.getByText('基础'))).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: '特性' }).or(page.getByText('特性'))).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: '装备' }).or(page.getByText('装备'))).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: '法术' }).or(page.getByText('法术'))).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: '传记' }).or(page.getByText('传记'))).toBeVisible({ timeout: 3000 });

    // 职业与物种应出现在页面中
    await expect(page.getByText('战士')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('矮人')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('侍僧')).toBeVisible({ timeout: 3000 });
  });
});
