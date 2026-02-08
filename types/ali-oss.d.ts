declare module 'ali-oss' {
  interface PutObjectOptions {
    headers?: Record<string, string>;
  }
  interface OSSOptions {
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
  }
  class OSS {
    constructor(options: OSSOptions);
    put(objectName: string, content: Buffer, options?: PutObjectOptions): Promise<{ url?: string }>;
  }
  export = OSS;
}
