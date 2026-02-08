/**
 * 阿里云邮件推送（Direct Mail）发送验证码
 * 环境变量：ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET, ALIYUN_DM_ACCOUNT_NAME, ALIYUN_DM_FROM_ALIAS(可选)
 * 本地测试正式发信：设置 REAL_EMAIL_IN_DEV=1 时，不退回「控制台打验证码」，必须配置上述变量并真实发信
 */

const CODE_EXPIRE_MINUTES = 5;

/** 本地是否强制走正式发信（不退回控制台打码） */
function forceRealEmailInDev(): boolean {
  return process.env.REAL_EMAIL_IN_DEV === '1' || process.env.REAL_EMAIL_IN_DEV === 'true';
}

function getVerificationEmailHtml(code: string, purpose: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
  <h2 style="color:#333;">D&D 2024 角色卡</h2>
  <p>您的验证码为：<strong style="font-size:24px;letter-spacing:4px;">${code}</strong></p>
  <p>用途：${purpose}。${CODE_EXPIRE_MINUTES} 分钟内有效，请勿泄露给他人。</p>
  <p style="color:#888;font-size:12px;">如非本人操作，请忽略此邮件。</p>
</body>
</html>
`.trim();
}

function getVerificationEmailText(code: string, purpose: string): string {
  return `D&D 2024 角色卡\n您的验证码：${code}\n用途：${purpose}。${CODE_EXPIRE_MINUTES}分钟内有效，请勿泄露。\n如非本人操作，请忽略此邮件。`;
}

const PURPOSE_MAP: Record<string, string> = {
  register: '注册账号',
  change_password: '修改密码',
  change_email: '更换邮箱',
  reset_password: '找回密码',
};

export async function sendVerificationEmail(
  toAddress: string,
  code: string,
  type: 'register' | 'change_password' | 'change_email' | 'reset_password'
): Promise<boolean> {
  const purpose = PURPOSE_MAP[type] || '验证';
  const subject = `【D&D 角色卡】${purpose}验证码`;

  if (!process.env.ALIYUN_ACCESS_KEY_ID || !process.env.ALIYUN_ACCESS_KEY_SECRET) {
    if (process.env.NODE_ENV === 'development' && !forceRealEmailInDev()) {
      console.log(`[DEV] 邮件验证码 -> ${toAddress} (${type}):`, code);
      return true;
    }
    console.error('未配置 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET');
    return false;
  }

  const accountName = process.env.ALIYUN_DM_ACCOUNT_NAME;
  if (!accountName) {
    if (process.env.NODE_ENV === 'development' && !forceRealEmailInDev()) {
      console.log(`[DEV] 邮件验证码 -> ${toAddress} (${type}):`, code);
      return true;
    }
    console.error('未配置 ALIYUN_DM_ACCOUNT_NAME（发信地址）');
    return false;
  }

  try {
    const Dm = (await import('@alicloud/dm20151123')).default;
    const core = await import('@alicloud/openapi-core') as {
      $OpenApiUtil: { Config: new (opts: { accessKeyId?: string; accessKeySecret?: string; endpoint?: string }) => object };
    };
    const config = new core.$OpenApiUtil.Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dm.aliyuncs.com',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = new Dm(config as any);

    const htmlBody = getVerificationEmailHtml(code, purpose);
    const textBody = getVerificationEmailText(code, purpose);

    const { SingleSendMailRequest } = await import('@alicloud/dm20151123');
    const req = new SingleSendMailRequest({
      accountName,
      addressType: 1,
      replyToAddress: false,
      subject,
      toAddress,
      htmlBody,
      textBody,
      fromAlias: process.env.ALIYUN_DM_FROM_ALIAS || 'D&D角色卡',
    });
    await client.singleSendMail(req);
    return true;
  } catch (err) {
    console.error('发送邮件失败:', err);
    return false;
  }
}
