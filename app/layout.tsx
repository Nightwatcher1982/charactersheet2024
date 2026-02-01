import type { Metadata, Viewport } from 'next';
import { Cinzel_Decorative, Crimson_Text } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const cinzel = Cinzel_Decorative({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-cinzel',
});

const crimsonText = Crimson_Text({ 
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-crimson',
});

// MedievalSharp 字体在 globals.css 中通过 @import 加载

export const metadata: Metadata = {
  title: 'DND 2024 角色卡创建工具',
  description: '一个基于 DND 2024 规则的角色卡创建和管理工具',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b7355', // 使用 DND 皮革色
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${cinzel.variable} ${crimsonText.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="font-crimson" suppressHydrationWarning>
        <div className="min-h-screen bg-parchment-light flex flex-col">
          <main className="flex-1">{children}</main>
          <footer className="py-6 text-center text-xs text-leather-light print:hidden">
            Dimvision 出品
          </footer>
        </div>
      </body>
    </html>
  );
}
