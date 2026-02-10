'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Shield } from 'lucide-react';
import { getAssetPath, getApiUrl } from '@/lib/asset-path';

const AGREEMENT_VERSION = '1.0';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: 'login' | 'register' | 'forgot' =
    tabParam === 'register' ? 'register' : tabParam === 'forgot' ? 'forgot' : 'login';

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState(''); // 忘记密码：新密码
  const [agreed, setAgreed] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<'email' | 'form'>('email'); // 注册/忘记密码：先输邮箱发码，再填表单
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false); // 忘记密码提交成功
  const [registerSuccess, setRegisterSuccess] = useState(false); // 注册成功

  const sendCodeType = tab === 'register' ? 'register' : tab === 'forgot' ? 'reset_password' : 'register';
  const handleSendCode = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('请输入正确的邮箱地址');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/send-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), type: sendCodeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '发送失败');
        return;
      }
      if (data.code) setDevCode(data.code);
      setStep('form');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('请输入正确的邮箱地址');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('请输入6位验证码');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('新密码至少 8 位');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '重置失败');
        return;
      }
      setResetSuccess(true);
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('请输入正确的邮箱地址');
      return;
    }
    if (!password || password.length < 8) {
      setError('密码至少 8 位');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError('请输入6位验证码');
      return;
    }
    if (!agreed) {
      setError('请先阅读并同意用户协议与隐私政策');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          code,
          agreementVersion: agreed ? AGREEMENT_VERSION : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '注册失败');
        return;
      }
      setRegisterSuccess(true);
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('请输入正确的邮箱地址');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || '登录失败';
        if (res.status === 401 && /@test\.com$/i.test(email.trim())) {
          setError(`${msg}。若为测试账号，请先在项目根目录执行：npx tsx scripts/create-test-users.ts`);
        } else {
          setError(msg);
        }
        return;
      }
      // 若为 DM 工具回调（完整 URL），带 token 跳转，供 DM 服务存 localStorage
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl && data.token) {
        try {
          const decoded = decodeURIComponent(redirectUrl);
          if (decoded.startsWith('http')) {
            const sep = decoded.includes('?') ? '&' : '?';
            window.location.href = `${decoded}${sep}token=${encodeURIComponent(data.token)}`;
            return;
          }
        } catch {
          // 忽略非法 redirect，走下方站内跳转
        }
      }
      const from = searchParams.get('from');
      const redirectTo = from ? decodeURIComponent(from) : '/';
      router.push(redirectTo.startsWith('/') ? redirectTo : '/');
      router.refresh();
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* 全屏背景：金色传送门与冒险者（登录/注册页） */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getAssetPath('/pic/login-bg.png')})` }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" aria-hidden />
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-amber-300 mx-auto mb-4 drop-shadow-md" />
          <h1 className="text-3xl font-bold text-white mb-2 font-cinzel drop-shadow-md">D&D 2024 角色卡</h1>
          <p className="text-amber-100/95 font-medieval drop-shadow">使用邮箱登录，管理您的角色</p>
          {searchParams.get('from') && (
            <p className="text-sm text-amber-200/90 mt-2 drop-shadow">登录后将返回您之前的页面</p>
          )}
        </div>

        <div className="rounded-2xl border-2 border-amber-200/50 bg-white/5 backdrop-blur-sm shadow-xl p-6 text-white">
          {tab === 'login' && (
            <>
              <h2 className="text-xl font-bold text-white mb-6 font-cinzel drop-shadow-sm">邮箱登录</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-white mb-2">
                    <Mail className="w-4 h-4 inline mr-1" /> 邮箱
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-white mb-2">
                    <Lock className="w-4 h-4 inline mr-1" /> 密码
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
                    autoComplete="current-password"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-amber-300 bg-white/20"
                  />
                  记住我（约 30 天免登录）
                </label>
                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="btn-dnd w-full py-3"
                >
                  {loading ? '登录中...' : '登录'}
                </button>
                <p className="text-center text-sm text-white">
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(''); setStep('email'); setRegisterSuccess(false); }}
                    className="text-amber-200 hover:text-amber-100 underline"
                  >
                    注册
                  </button>
                  <span className="mx-2">·</span>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setError(''); setStep('email'); setResetSuccess(false); }}
                    className="text-amber-200 hover:text-amber-100 underline"
                  >
                    忘记密码
                  </button>
                </p>
              </div>
            </>
          )}

          {tab === 'forgot' && (
            <>
              <p className="mb-4">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); setStep('email'); setResetSuccess(false); }}
                  className="text-sm text-amber-200 hover:text-amber-100 underline"
                >
                  ← 返回登录
                </button>
              </p>
              <h2 className="text-xl font-bold text-white mb-6 font-cinzel drop-shadow-sm">找回密码</h2>
              {resetSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg text-green-800 text-sm shadow-dnd">
                    密码已重置，请使用新密码登录。
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setResetSuccess(false); setEmail(''); setCode(''); setNewPassword(''); }}
                    className="btn-dnd w-full py-3"
                  >
                    去登录
                  </button>
                </div>
              ) : step === 'email' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-white mb-2">
                      <Mail className="w-4 h-4 inline mr-1" /> 注册邮箱
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入注册时使用的邮箱"
                      className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
                      autoComplete="email"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleSendCode}
                    disabled={loading || !email}
                    className="btn-dnd w-full py-3"
                  >
                    {loading ? '发送中...' : '获取验证码'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">邮箱</label>
                    <p className="text-white">{email}</p>
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setCode(''); setError(''); setDevCode(''); }}
                      className="text-sm text-amber-200 hover:text-amber-100 mt-1"
                    >
                      更换邮箱
                    </button>
                  </div>
                  {devCode && (
                    <div className="p-3 bg-amber-900/40 border-2 border-amber-300/60 rounded-lg shadow-dnd">
                      <p className="text-sm text-white">
                        <strong>开发模式验证码：</strong> {devCode}
                      </p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="forgot-code" className="block text-sm font-medium text-white mb-2">
                      验证码
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="forgot-code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6位验证码"
                        className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80 flex-1 text-center text-xl tracking-widest"
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                      {countdown > 0 ? (
                        <span className="self-center text-white text-sm">{countdown}秒</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendCode}
                          className="btn-dnd py-2 px-3 whitespace-nowrap"
                        >
                          重发
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="forgot-new-password" className="block text-sm font-medium text-white mb-2">
                      <Lock className="w-4 h-4 inline mr-1" /> 新密码（至少 8 位）
                    </label>
                    <input
                      id="forgot-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请设置新密码"
                      className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
                      autoComplete="new-password"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleResetPassword}
                    disabled={loading || !code || code.length !== 6 || !newPassword || newPassword.length < 8}
                    className="btn-dnd w-full py-3"
                  >
                    {loading ? '提交中...' : '重置密码'}
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'register' && (
            <>
              <p className="mb-4">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); setStep('email'); setRegisterSuccess(false); }}
                  className="text-sm text-amber-200 hover:text-amber-100 underline"
                >
                  ← 返回登录
                </button>
              </p>
              <h2 className="text-xl font-bold text-white mb-6 font-cinzel drop-shadow-sm">邮箱注册</h2>
              {registerSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg text-green-800 text-sm shadow-dnd">
                    <p className="font-medium mb-1">注册成功！</p>
                    <p>请使用您的邮箱和密码登录。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setRegisterSuccess(false);
                    }}
                    className="btn-dnd w-full py-3"
                  >
                    去登录
                  </button>
                </div>
              ) : step === 'email' ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-white mb-2">
                      <Mail className="w-4 h-4 inline mr-1" /> 邮箱
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱"
                      className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
                      autoComplete="email"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleSendCode}
                    disabled={loading || !email}
                    className="btn-dnd w-full py-3"
                  >
                    {loading ? '发送中...' : '获取验证码'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">邮箱</label>
                    <p className="text-white">{email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setError('');
                        setDevCode('');
                      }}
                      className="text-sm text-amber-200 hover:text-amber-100 mt-1"
                    >
                      更换邮箱
                    </button>
                  </div>
                  {devCode && (
                    <div className="p-3 bg-amber-900/40 border-2 border-amber-300/60 rounded-lg shadow-dnd">
                      <p className="text-sm text-white">
                        <strong>开发模式验证码：</strong> {devCode}
                      </p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="reg-code" className="block text-sm font-medium text-white mb-2">
                      验证码
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="reg-code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6位验证码"
                        className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80 flex-1 text-center text-xl tracking-widest"
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                      {countdown > 0 ? (
                        <span className="self-center text-white text-sm">{countdown}秒</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendCode}
                          className="btn-dnd py-2 px-3 whitespace-nowrap"
                        >
                          重发
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-white mb-2">
                      <Lock className="w-4 h-4 inline mr-1" /> 密码（至少 8 位）
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请设置密码"
                      className="input-dnd bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
                      autoComplete="new-password"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 rounded border-amber-300 bg-white/20"
                    />
                    我已阅读并同意 <a href="#" className="text-amber-200 underline hover:text-amber-100">用户协议</a> 与 <a href="#" className="text-amber-200 underline hover:text-amber-100">隐私政策</a>
                  </label>
                  {error && (
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleRegister}
                    disabled={loading || !code || code.length !== 6 || !password || password.length < 8 || !agreed}
                    className="btn-dnd w-full py-3"
                  >
                    {loading ? '注册中...' : '注册'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-white drop-shadow-md">
          <p>登录即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${getAssetPath('/pic/login-bg.png')})` }} aria-hidden />
        <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" aria-hidden />
        <p className="relative z-10 text-white drop-shadow-md">加载中...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
