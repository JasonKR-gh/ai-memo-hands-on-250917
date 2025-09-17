// lib/ai/index.ts
// AI 서비스 메인 진입점
// 모든 AI 관련 기능을 외부에서 사용할 수 있도록 export합니다
// 관련 파일: gemini-client.ts, types.ts, errors.ts, config.ts, utils.ts

export { GeminiClient, getGeminiClient, resetGeminiClient } from './gemini-client';
export { 
  GeminiError, 
  createGeminiError, 
  classifyError, 
  isRetryableError,
  extractErrorInfo 
} from './errors';
export { 
  getGeminiConfig, 
  logConfig, 
  getDefaultConfig, 
  validateConfig 
} from './config';
export {
  estimateTokens,
  validateTokenLimit,
  logAPIUsage,
  withRetry,
  sleep,
  truncateText,
  measureLatency,
  calculateUsageStats,
  calculateErrorRate,
  estimateCost
} from './utils';
export type {
  GeminiRequest,
  GeminiResponse,
  AIService,
  APIUsageLog,
  GeminiConfig,
  GeminiErrorType,
  RetryConfig
} from './types';
