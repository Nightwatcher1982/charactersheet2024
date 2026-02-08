import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

/**
 * 角色创建 E2E 测试配置
 * 运行前需启动开发服务器（npm run dev），并在 .env 中配置 E2E_TEST_EMAIL / E2E_TEST_PASSWORD
 * @see docs/README-e2e.md
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  timeout: 180000,
  expect: { timeout: 10000 },
});
