// lib/ai/utils.ts
// AI 서비스 유틸리티 함수들
// 토큰 계산, 사용량 로깅, 재시도 로직 등을 제공합니다
// 관련 파일: types.ts, gemini-client.ts

import { APIUsageLog } from './types';
import { isRetryableError } from './errors';

/**
 * 텍스트의 대략적인 토큰 수를 계산
 * Gemini는 대략 1토큰 = 4문자로 계산됩니다
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // 공백과 특수문자를 고려한 더 정확한 계산
  const words = text.split(/\s+/).length;
  const characters = text.length;
  
  // 단어 기반 계산과 문자 기반 계산의 평균
  const wordBasedTokens = words * 1.3; // 평균 단어당 1.3토큰
  const charBasedTokens = characters / 4; // 4문자당 1토큰
  
  return Math.ceil((wordBasedTokens + charBasedTokens) / 2);
}

/**
 * 토큰 제한 검증
 */
export function validateTokenLimit(
  inputTokens: number,
  maxTokens: number = 8192
): boolean {
  // 응답용 토큰도 고려하여 여유분 확보
  const reservedTokens = Math.min(2000, maxTokens * 0.2);
  return inputTokens <= maxTokens - reservedTokens;
}

/**
 * API 사용량 로깅
 */
export function logAPIUsage(log: APIUsageLog): void {
  const logMessage = {
    timestamp: log.timestamp.toISOString(),
    model: log.model,
    inputTokens: log.inputTokens,
    outputTokens: log.outputTokens,
    totalTokens: log.inputTokens + log.outputTokens,
    latencyMs: log.latencyMs,
    success: log.success,
    error: log.error
  };

  // 개발 환경에서는 콘솔 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('[Gemini API Usage]', logMessage);
  }

  // 프로덕션에서는 실제 로깅 시스템으로 전송
  // TODO: 로깅 시스템 연동 (예: Winston, Pino 등)
  if (process.env.NODE_ENV === 'production') {
    // 여기에 실제 로깅 시스템 연동 코드 추가
    console.log('[Gemini API Usage]', logMessage);
  }
}

/**
 * 재시도 로직을 적용한 함수 실행
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // 재시도 불가능한 에러는 즉시 throw
      if (!isRetryableError(error)) {
        throw error;
      }

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < maxRetries) {
        const delay = backoffMs * Math.pow(2, attempt - 1); // 지수 백오프
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * 지연 함수
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 텍스트를 안전하게 자르기 (토큰 제한 고려)
 */
export function truncateText(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // 토큰 수에 비례하여 텍스트 자르기
  const ratio = maxTokens / estimatedTokens;
  const targetLength = Math.floor(text.length * ratio * 0.9); // 10% 여유분
  
  return text.substring(0, targetLength) + '...';
}

/**
 * API 응답 시간 측정
 */
export function measureLatency<T>(
  operation: () => Promise<T>
): Promise<{ result: T; latencyMs: number }> {
  const startTime = Date.now();
  
  return operation().then(result => {
    const latencyMs = Date.now() - startTime;
    return { result, latencyMs };
  });
}

/**
 * 사용량 통계 계산
 */
export function calculateUsageStats(logs: APIUsageLog[]): {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  totalTokens: number;
  averageTokensPerRequest: number;
} {
  if (logs.length === 0) {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      totalTokens: 0,
      averageTokensPerRequest: 0
    };
  }

  const successfulLogs = logs.filter(log => log.success);
  const totalTokens = logs.reduce((sum, log) => sum + log.inputTokens + log.outputTokens, 0);
  const totalLatency = logs.reduce((sum, log) => sum + log.latencyMs, 0);

  return {
    totalRequests: logs.length,
    successfulRequests: successfulLogs.length,
    failedRequests: logs.length - successfulLogs.length,
    averageLatency: totalLatency / logs.length,
    totalTokens,
    averageTokensPerRequest: totalTokens / logs.length
  };
}

/**
 * 에러 발생률 계산
 */
export function calculateErrorRate(logs: APIUsageLog[]): number {
  if (logs.length === 0) return 0;
  
  const failedLogs = logs.filter(log => !log.success);
  return (failedLogs.length / logs.length) * 100;
}

/**
 * 토큰 사용량을 비용으로 추정 (대략적)
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number
): number {
  // Gemini 2.0 Flash의 대략적인 가격 (2024년 기준)
  // 실제 가격은 Google Cloud Console에서 확인 필요
  const inputPricePer1K = 0.000075; // $0.075 per 1K input tokens
  const outputPricePer1K = 0.0003;  // $0.30 per 1K output tokens
  
  const inputCost = (inputTokens / 1000) * inputPricePer1K;
  const outputCost = (outputTokens / 1000) * outputPricePer1K;
  
  return inputCost + outputCost;
}
