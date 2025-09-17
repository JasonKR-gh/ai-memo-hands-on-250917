// lib/ai/config.ts
// AI 서비스 설정 관리
// 환경변수를 통한 Gemini API 설정을 관리하고 검증합니다
// 관련 파일: types.ts, gemini-client.ts

import { GeminiConfig } from './types';

/**
 * 환경변수에서 Gemini 설정을 가져오고 검증
 */
export function getGeminiConfig(): GeminiConfig {
  const config: GeminiConfig = {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192'),
    timeout: parseInt(process.env.GEMINI_TIMEOUT_MS || '10000'),
    debug: process.env.GEMINI_DEBUG === 'true',
    rateLimitPerMinute: parseInt(process.env.GEMINI_RATE_LIMIT || '60')
  };

  // 필수 설정 검증
  if (!config.apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  // 설정값 유효성 검증
  if (config.maxTokens <= 0 || config.maxTokens > 32768) {
    throw new Error('GEMINI_MAX_TOKENS는 1-32768 사이의 값이어야 합니다.');
  }

  if (config.timeout <= 0 || config.timeout > 60000) {
    throw new Error('GEMINI_TIMEOUT_MS는 1-60000 사이의 값이어야 합니다.');
  }

  if (config.rateLimitPerMinute <= 0) {
    throw new Error('GEMINI_RATE_LIMIT는 0보다 큰 값이어야 합니다.');
  }

  return config;
}

/**
 * 개발 환경에서 설정 정보를 로깅
 */
export function logConfig(config: GeminiConfig): void {
  if (config.debug) {
    console.log('[Gemini Config]', {
      model: config.model,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
      debug: config.debug,
      rateLimitPerMinute: config.rateLimitPerMinute,
      // API 키는 보안상 마스킹 처리
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'NOT_SET'
    });
  }
}

/**
 * 환경별 기본 설정 반환
 */
export function getDefaultConfig(): Partial<GeminiConfig> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  const baseConfig = {
    model: 'gemini-2.0-flash-001',
    maxTokens: 8192,
    timeout: 10000,
    rateLimitPerMinute: 60
  };

  switch (nodeEnv) {
    case 'development':
      return {
        ...baseConfig,
        debug: true,
        timeout: 15000 // 개발 환경에서는 더 긴 타임아웃
      };
    
    case 'production':
      return {
        ...baseConfig,
        debug: false,
        timeout: 8000, // 프로덕션에서는 더 짧은 타임아웃
        rateLimitPerMinute: 30 // 프로덕션에서는 더 보수적인 제한
      };
    
    case 'test':
      return {
        ...baseConfig,
        debug: false,
        timeout: 5000,
        rateLimitPerMinute: 10
      };
    
    default:
      return baseConfig;
  }
}

/**
 * 설정 검증 함수
 */
export function validateConfig(config: GeminiConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('API 키가 설정되지 않았습니다.');
  }

  if (!config.model) {
    errors.push('모델명이 설정되지 않았습니다.');
  }

  if (config.maxTokens < 1 || config.maxTokens > 32768) {
    errors.push('최대 토큰 수가 유효하지 않습니다. (1-32768)');
  }

  if (config.timeout < 1000 || config.timeout > 60000) {
    errors.push('타임아웃 값이 유효하지 않습니다. (1000-60000ms)');
  }

  if (config.rateLimitPerMinute < 1) {
    errors.push('분당 요청 제한이 유효하지 않습니다. (1 이상)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
