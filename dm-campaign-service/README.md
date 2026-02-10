DM 战役服务（与角色卡服务分离，共享用户与会员信息，通过 JWT 鉴权）。详见父项目 `docs/DM工具技术架构.md` 与 `docs/DM工具分阶段任务与验证计划.md`。

## 环境变量

复制 `.env.example` 为 `.env`，配置：

- **JWT_SECRET**：与角色卡服务一致，用于校验角色卡签发的 JWT。
- **CHARACTER_SHEET_API_URL**：角色卡服务 base URL（阶段 1 起拉角色列表等会用到）。

本地同时跑角色卡与 DM 服务时，DM 可改用端口 3001：`npm run dev:3001` 或 `npm run dev -- -p 3001`。

**若出现 `_next/static/... 404`（main-app.js、app-pages-internals.js 等）**：
1. **确认端口一致**：必须在 `dm-campaign-service` 目录用 **`npm run dev:3001`** 启动，浏览器访问 **http://localhost:3001/...**。若用 `npm run dev` 会跑在 3000，访问 3001 会打到别的进程，chunk 必 404。
2. **清缓存**：清空 `.next` 重启后，请**关掉所有 3001 的标签页**，再新开一个标签访问邀请链接；或对该页**硬刷新**（Cmd+Shift+R / Ctrl+Shift+R）。

## Getting Started

```bash
npm install
cp .env.example .env
# 编辑 .env：JWT_SECRET（与角色卡一致）、DATABASE_URL、NEXT_PUBLIC_CHARACTER_SHEET_URL
npx prisma migrate deploy   # 或 migrate dev（首次建表）
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (或 3001) with your browser.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
