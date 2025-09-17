// __tests__/setup.ts
// 테스트 환경 설정
// 모든 테스트에서 공통으로 사용되는 설정을 정의합니다

import { vi } from 'vitest';

// 환경변수 기본값 설정
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true
});
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.GEMINI_MODEL = 'gemini-2.0-flash-001';
process.env.GEMINI_MAX_TOKENS = '8192';
process.env.GEMINI_TIMEOUT_MS = '10000';
process.env.GEMINI_DEBUG = 'false';
process.env.GEMINI_RATE_LIMIT = '60';

// 콘솔 로그 모킹 (테스트 중 노이즈 방지)
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};
