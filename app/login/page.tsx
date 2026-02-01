'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState(''); // 开发模式显示验证码

  const handleSendCode = async () => {
    setError('');
    
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '发送失败');
        return;
      }

      // 开发模式显示验证码
      if (data.code) {
        setDevCode(data.code);
      }

      setStep('code');
      setCountdown(60);

      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    
    if (!/^\d{6}$/.test(code)) {
      setError('请输入6位验证码');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '验证失败');
        return;
      }

      // 登录成功，跳转到首页
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-light flex items-center justify-center px-4 bg-pattern-parchment">
      <div className="max-w-md w-full">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-gold-dark mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-leather-dark mb-2 font-cinzel">D&D 2024 角色卡</h1>
          <p className="text-leather-base font-medieval">使用手机号登录，管理您的角色</p>
        </div>

        {/* 登录卡片 */}
        <div className="card-dnd">
          {step === 'phone' ? (
            <>
              <h2 className="text-xl font-bold text-leather-dark mb-6 font-cinzel">手机号登录</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone-input" className="block text-sm font-medium text-leather-dark mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    手机号
                  </label>
                  <input
                    id="phone-input"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="请输入手机号"
                    className="input-dnd"
                    maxLength={11}
                    autoComplete="tel"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={loading || !phone}
                  className="btn-dnd w-full py-3"
                >
                  {loading ? '发送中...' : '获取验证码'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-leather-dark mb-2 font-cinzel">输入验证码</h2>
              <p className="text-sm text-leather-base mb-6">
                验证码已发送至 {phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </p>

              {devCode && (
                <div className="mb-4 p-3 bg-gold-light/30 border-2 border-gold-base rounded-lg shadow-dnd">
                  <p className="text-sm text-leather-dark">
                    <strong>开发模式验证码：</strong> {devCode}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="code-input" className="block text-sm font-medium text-leather-dark mb-2">
                    验证码
                  </label>
                  <input
                    id="code-input"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="请输入6位验证码"
                    className="input-dnd text-center text-2xl tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm shadow-dnd">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={loading || code.length !== 6}
                  className="btn-dnd w-full py-3"
                >
                  {loading ? '验证中...' : '登录'}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => {
                      setStep('phone');
                      setCode('');
                      setError('');
                      setDevCode('');
                    }}
                    className="text-leather-base hover:text-leather-dark"
                  >
                    ← 返回修改手机号
                  </button>
                  
                  {countdown > 0 ? (
                    <span className="text-leather-light">{countdown}秒后可重新发送</span>
                  ) : (
                    <button
                      onClick={handleSendCode}
                      className="text-gold-dark hover:text-gold-base"
                    >
                      重新发送
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-sm text-leather-base">
          <p>登录即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
}
