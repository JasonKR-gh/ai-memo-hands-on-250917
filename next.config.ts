import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GEMINI_MAX_TOKENS: process.env.GEMINI_MAX_TOKENS,
    GEMINI_TIMEOUT_MS: process.env.GEMINI_TIMEOUT_MS,
  },
  serverExternalPackages: ['@google/genai', 'postgres'],
  // Vercel 배포 시 리다이렉트 문제 해결
  trailingSlash: false,
  async redirects() {
    return []
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 사이드에서 Node.js 내장 모듈들을 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        path: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        events: false,
        readline: false,
        repl: false,
        timers: false,
        tty: false,
        vm: false,
        worker_threads: false,
      }
      
      // postgres 패키지를 완전히 제외
      config.externals = config.externals || []
      config.externals.push('postgres')
    }
    return config
  }
};

export default nextConfig;
