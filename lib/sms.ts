import Dysmsapi, * as $Dysmsapi from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';

// 阿里云短信配置
const config = new $OpenApi.Config({
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  endpoint: 'dysmsapi.aliyuncs.com',
});

const client = new Dysmsapi(config);

/**
 * 发送验证码短信
 * @param phone 手机号
 * @param code 验证码
 * @returns 是否发送成功
 */
export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  try {
    const sendSmsRequest = new $Dysmsapi.SendSmsRequest({
      phoneNumbers: phone,
      signName: process.env.ALIYUN_SMS_SIGN_NAME || 'DND角色卡',
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_123456789',
      templateParam: JSON.stringify({ code }),
    });

    const response = await client.sendSms(sendSmsRequest);
    
    return response.body?.code === 'OK';
  } catch (error) {
    console.error('发送短信失败:', error);
    return false;
  }
}

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 验证手机号格式
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
