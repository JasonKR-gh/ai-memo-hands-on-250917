// lib/ai/errors.ts
// AI 서비스 에러 정의 및 처리
// Gemini API 에러를 분류하고 적절한 에러 메시지를 제공합니다
// 관련 파일: types.ts, gemini-client.ts

import { GeminiErrorType } from './types';

/**
 * Gemini API 커스텀 에러 클래스
 */
export class GeminiError extends Error {
  constructor(
    public type: GeminiErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

/**
 * 에러 타입별 메시지 매핑
 */
const ERROR_MESSAGES: Record<GeminiErrorType, string> = {
  [GeminiErrorType.API_KEY_INVALID]: 'API 키가 유효하지 않습니다. 환경변수를 확인해주세요.',
  [GeminiErrorType.QUOTA_EXCEEDED]: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  [GeminiErrorType.TIMEOUT]: 'API 요청이 시간 초과되었습니다. 네트워크 상태를 확인해주세요.',
  [GeminiErrorType.CONTENT_FILTERED]: '요청한 내용이 정책에 의해 차단되었습니다.',
  [GeminiErrorType.NETWORK_ERROR]: '네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.',
  [GeminiErrorType.UNKNOWN]: '알 수 없는 오류가 발생했습니다.'
};

/**
 * 원본 에러를 분석하여 GeminiErrorType을 결정
 */
export function classifyError(error: unknown): GeminiErrorType {
  if (!error) return GeminiErrorType.UNKNOWN;

  const errorMessage = (error as Error).message?.toLowerCase() || '';
  const errorCode = (error as { code?: number; status?: number }).code || (error as { code?: number; status?: number }).status;

  // API 키 관련 에러
  if (errorCode === 401 || errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
    return GeminiErrorType.API_KEY_INVALID;
  }

  // 할당량 초과 에러
  if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
    return GeminiErrorType.QUOTA_EXCEEDED;
  }

  // 타임아웃 에러
  if (errorCode === 408 || errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return GeminiErrorType.TIMEOUT;
  }

  // 콘텐츠 필터링 에러
  if (errorCode === 400 && (errorMessage.includes('safety') || errorMessage.includes('filtered'))) {
    return GeminiErrorType.CONTENT_FILTERED;
  }

  // 네트워크 에러
  if ((errorCode && errorCode >= 500) || errorMessage.includes('network') || errorMessage.includes('connection')) {
    return GeminiErrorType.NETWORK_ERROR;
  }

  return GeminiErrorType.UNKNOWN;
}

/**
 * 에러를 GeminiError로 변환
 */
export function createGeminiError(error: unknown): GeminiError {
  const type = classifyError(error);
  const message = ERROR_MESSAGES[type];
  
  return new GeminiError(type, message, error);
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: unknown): boolean {
  const type = classifyError(error);
  
  // 재시도 가능한 에러 타입들
  const retryableTypes = [
    GeminiErrorType.TIMEOUT,
    GeminiErrorType.NETWORK_ERROR,
    GeminiErrorType.QUOTA_EXCEEDED // 일시적인 할당량 초과의 경우
  ];
  
  return retryableTypes.includes(type);
}

/**
 * 에러 로깅을 위한 정보 추출
 */
export function extractErrorInfo(error: unknown): {
  type: GeminiErrorType;
  message: string;
  originalError?: unknown;
  timestamp: Date;
} {
  return {
    type: classifyError(error),
    message: (error as Error).message || 'Unknown error',
    originalError: error,
    timestamp: new Date()
  };
}
