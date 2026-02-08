import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment-light bg-pattern-parchment flex flex-col items-center justify-center px-4">
      <div className="card-dnd max-w-md w-full text-center">
        <h1 className="font-cinzel text-2xl font-bold text-leather-dark mb-2">页面未找到</h1>
        <p className="text-leather-base mb-6">您访问的地址不存在。</p>
        <Link href="/" className="btn-dnd inline-block">
          返回首页
        </Link>
      </div>
    </div>
  );
}
