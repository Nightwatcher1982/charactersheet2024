'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function SettingsSecurityPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<
    'menu' | 'change_password' | 'change_email_step1' | 'change_email_step2' | 'forgot_password' | 'deactivate'
  >('menu');
  const [loginLogs, setLoginLogs] = useState<{ id: string; ip: string | null; userAgent: string | null; createdAt: string }[]>([]);
  const [codeSentTo, setCodeSentTo] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmailCode, setNewEmailCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devCode, setDevCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          if (!cancelled) router.replace('/login');
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.isLoggedIn) {
          if (!cancelled) router.replace('/login');
          return;
        }
        if (!cancelled) setEmail(data.user.email ?? null);
      } catch {
        if (!cancelled) router.replace('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (step !== 'menu' || !email) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/login-history?limit=20');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.logs) setLoginLogs(data.logs);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, email]);

  const sendCode = async (type: 'change_password' | 'change_email' | 'reset_password', targetEmail?: string) => {
    const to = type === 'change_email' && targetEmail ? targetEmail : email;
    if (!to) {
      setError('未绑定邮箱');
      return;
    }
    setError('');
    setLoadingAction(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: to.toLowerCase(),
          type,
          ...(type === 'change_email' && targetEmail && { newEmail: targetEmail.toLowerCase() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '发送失败');
        return;
      }
      if (data.code) setDevCode(data.code);
      setCodeSentTo(to);
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
      if (type === 'change_email' && targetEmail) setStep('change_email_step2');
    } catch {
      setError('网络错误');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoadingAction(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '修改失败');
        return;
      }
      setMessage('密码已修改');
      setStep('menu');
      setCurrentCode('');
      setNewPassword('');
    } catch {
      setError('网络错误');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoadingAction(true);
    try {
      const res = await fetch('/api/user/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmailCode: currentCode,
          newEmail: newEmail.trim().toLowerCase(),
          newEmailCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '更换失败');
        return;
      }
      setMessage('邮箱已更换');
      setEmail(data.email);
      setStep('menu');
      setCurrentCode('');
      setNewEmail('');
      setNewEmailCode('');
    } catch {
      setError('网络错误');
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-amber-200/50 bg-white/5 backdrop-blur-sm shadow-xl p-8 text-center text-white">加载中...</div>
    );
  }

  const handleLogoutAll = async () => {
    if (!confirm('确定要登出所有设备吗？其他设备需重新登录。')) return;
    setLoadingAction(true);
    setError('');
    try {
      const res = await fetch('/api/auth/logout-all', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '操作失败');
        return;
      }
      router.replace('/login');
      router.refresh();
    } catch {
      setError('网络错误');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('注销后账号将无法登录，角色数据仍保留。确定要注销吗？')) return;
    setError('');
    setLoadingAction(true);
    try {
      const res = await fetch('/api/user/deactivate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '注销失败');
        return;
      }
      router.replace('/login');
      router.refresh();
    } catch {
      setError('网络错误');
    } finally {
      setLoadingAction(false);
    }
  };

  const cardClass = 'rounded-2xl border-2 border-amber-200/50 bg-white/5 backdrop-blur-sm shadow-xl p-6 text-white';
  const labelClass = 'block text-sm font-medium text-white mb-2';
  const inputClass = 'input-dnd w-full bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80';
  const mutedClass = 'text-sm text-amber-100/90 mb-2';
  const headingClass = 'text-lg font-bold text-white font-cinzel mb-2';
  const headingXlClass = 'text-xl font-bold text-white font-cinzel mb-4';
  const backBtnClass = 'text-amber-200 hover:text-amber-100 mb-4';

  if (step === 'menu') {
    return (
      <div className={`${cardClass} space-y-4`}>
        {message && (
          <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}
        {loginLogs.length > 0 && (
          <>
            <div>
              <h2 className={headingClass}>登录历史</h2>
              <p className={mutedClass}>最近登录记录（IP、设备、时间）</p>
              <ul className="space-y-2 max-h-48 overflow-y-auto text-sm text-white">
                {loginLogs.map((log) => (
                  <li key={log.id} className="flex flex-wrap gap-2 border-b border-amber-200/50 pb-2">
                    <span>{log.ip || '—'}</span>
                    <span className="text-white/80 truncate max-w-[200px]" title={log.userAgent ?? ''}>
                      {log.userAgent || '—'}
                    </span>
                    <span className="text-white/80 ml-auto">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <hr className="border-amber-200/50" />
          </>
        )}
        <div>
          <h2 className={headingClass}>修改密码</h2>
          <p className={mutedClass}>向当前邮箱发送验证码后设置新密码。</p>
          <button
            type="button"
            onClick={() => setStep('change_password')}
            className="btn-dnd"
          >
            修改密码
          </button>
        </div>
        <hr className="border-amber-200/50" />
        <div>
          <h2 className={headingClass}>更换邮箱</h2>
          <p className={mutedClass}>先验证当前邮箱，再验证新邮箱。</p>
          <button
            type="button"
            onClick={() => setStep('change_email_step1')}
            className="btn-dnd"
          >
            更换邮箱
          </button>
        </div>
        <hr className="border-amber-200/50" />
        <div>
          <h2 className={headingClass}>登出所有设备</h2>
          <p className={mutedClass}>使本账号在所有设备上的登录失效，需重新登录。</p>
          <button
            type="button"
            onClick={handleLogoutAll}
            disabled={loadingAction}
            className="btn-dnd"
          >
            {loadingAction ? '处理中...' : '登出所有设备'}
          </button>
        </div>
        <hr className="border-amber-200/50" />
        <div>
          <h2 className={headingClass}>忘记密码</h2>
          <p className={mutedClass}>未登录时在登录页使用「忘记密码」通过邮箱验证码重置。</p>
          <Link href="/login" className="btn-dnd inline-block">
            前往登录页
          </Link>
        </div>
        <hr className="border-amber-200/50" />
        <div>
          <h2 className="text-lg font-bold text-white font-cinzel mb-2 text-red-300">账号注销</h2>
          <p className={mutedClass}>注销后无法登录，角色数据保留。需邮箱验证码确认。</p>
          <button
            type="button"
            onClick={() => setStep('deactivate')}
            className="px-4 py-2 border-2 border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            申请注销
          </button>
        </div>
      </div>
    );
  }

  if (step === 'deactivate') {
    return (
      <div className={cardClass}>
        <button type="button" onClick={() => setStep('menu')} className={backBtnClass}>
          ← 返回
        </button>
        <h2 className="text-xl font-bold text-red-300 font-cinzel mb-4">账号注销</h2>
        <p className="text-white mb-4">
          向当前邮箱发送验证码后输入以确认注销。注销后账号将无法登录，角色数据保留。
        </p>
        <form onSubmit={handleDeactivate} className="space-y-4">
          {devCode && (
            <div className="p-3 bg-amber-900/40 border-2 border-amber-300/60 rounded-lg text-sm text-white">
              开发模式验证码：{devCode}
            </div>
          )}
          <div>
            <label className={labelClass}>邮箱验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6位验证码"
                className={`${inputClass} flex-1`}
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => sendCode('change_password')}
                disabled={loadingAction || countdown > 0}
                className="btn-dnd py-2 px-3 whitespace-nowrap"
              >
                {loadingAction ? '发送中...' : countdown > 0 ? `${countdown}秒` : '发送验证码'}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loadingAction || currentCode.length !== 6}
            className="px-4 py-2 border-2 border-red-500 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            {loadingAction ? '提交中...' : '确认注销'}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'change_password') {
    return (
      <div className={cardClass}>
        <button type="button" onClick={() => setStep('menu')} className={backBtnClass}>
          ← 返回
        </button>
        <h2 className={headingXlClass}>修改密码</h2>
        {!codeSentTo ? (
          <div>
            <p className="text-white mb-2">验证码将发送至：{email}</p>
            <button
              type="button"
              onClick={() => sendCode('change_password')}
              disabled={loadingAction || countdown > 0}
              className="btn-dnd w-full py-3"
            >
              {loadingAction ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {devCode && (
              <div className="p-3 bg-amber-900/40 border-2 border-amber-300/60 rounded-lg text-sm text-white">
                开发模式验证码：{devCode}
              </div>
            )}
            <div>
              <label className={labelClass}>验证码</label>
              <input
                type="text"
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6位验证码"
                className={inputClass}
                maxLength={6}
              />
            </div>
            <div>
              <label className={labelClass}>新密码（至少8位）</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新密码"
                className={inputClass}
                minLength={8}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loadingAction || currentCode.length !== 6 || newPassword.length < 8}
              className="btn-dnd w-full py-3"
            >
              {loadingAction ? '提交中...' : '确认修改'}
            </button>
          </form>
        )}
      </div>
    );
  }

  if (step === 'change_email_step1') {
    return (
      <div className={cardClass}>
        <button type="button" onClick={() => setStep('menu')} className={backBtnClass}>
          ← 返回
        </button>
        <h2 className={headingXlClass}>更换邮箱 - 验证当前邮箱</h2>
        {!codeSentTo ? (
          <div>
            <p className="text-white mb-2">验证码将发送至：{email}</p>
            <button
              type="button"
              onClick={() => sendCode('change_email')}
              disabled={loadingAction || countdown > 0}
              className="btn-dnd w-full py-3"
            >
              {loadingAction ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {devCode && (
              <div className="p-3 bg-amber-900/40 border-2 border-amber-300/60 rounded-lg text-sm text-white">
                开发模式验证码：{devCode}
              </div>
            )}
            <div>
              <label className={labelClass}>当前邮箱验证码</label>
              <input
                type="text"
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6位验证码"
                className={inputClass}
                maxLength={6}
              />
            </div>
            <div>
              <label className={labelClass}>新邮箱</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="新邮箱地址"
                className={inputClass}
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            <button
              type="button"
              onClick={() => {
                if (currentCode.length !== 6 || !newEmail) {
                  setError('请填写当前邮箱验证码和新邮箱');
                  return;
                }
                setError('');
                sendCode('change_email', newEmail.trim());
              }}
              disabled={loadingAction || currentCode.length !== 6 || !newEmail}
              className="btn-dnd w-full py-3"
            >
              {loadingAction ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '向新邮箱发送验证码'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'change_email_step2') {
    return (
      <div className={cardClass}>
        <h2 className={headingXlClass}>更换邮箱 - 验证新邮箱</h2>
        <form onSubmit={handleChangeEmail} className="space-y-4">
          {devCode && (
            <div className="p-3 bg-amber-900/40 border-2 border-amber-300/60 rounded-lg text-sm text-white">
              开发模式验证码：{devCode}
            </div>
          )}
          <div>
            <label className={labelClass}>当前邮箱验证码（已填）</label>
            <input type="text" value={currentCode} readOnly className={`${inputClass} bg-white/80`} />
          </div>
          <div>
            <label className={labelClass}>新邮箱</label>
            <input type="email" value={newEmail} readOnly className={`${inputClass} bg-white/80`} />
          </div>
          <div>
            <label className={labelClass}>新邮箱收到的验证码</label>
            <input
              type="text"
              value={newEmailCode}
              onChange={(e) => setNewEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6位验证码"
              className={inputClass}
              maxLength={6}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          {message && (
            <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg text-green-700 text-sm">{message}</div>
          )}
          <button
            type="submit"
            disabled={loadingAction || newEmailCode.length !== 6}
            className="btn-dnd w-full py-3"
          >
            {loadingAction ? '提交中...' : '确认更换'}
          </button>
        </form>
      </div>
    );
  }

  return null;
}
