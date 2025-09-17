// lib/ai/types.ts
// AI 서비스 관련 타입 정의
// Gemini API 요청/응답 타입과 공통 인터페이스를 정의합니다
// 관련 파일: gemini-client.ts, config.ts, errors.ts

/**
 * Gemini API 요청 타입
 */
export interface GeminiRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

/**
 * Gemini API 응답 타입
 */
export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

/**
 * AI 서비스 공통 인터페이스
 */
export interface AIService {
  generateText(prompt: string): Promise<string>;
  healthCheck(): Promise<boolean>;
}

/**
 * API 사용량 로그 타입
 */
export interface APIUsageLog {
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  error?: string;
}

/**
 * Gemini 설정 타입
 */
export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  timeout: number;
  debug: boolean;
  rateLimitPerMinute: number;
}

/**
 * 에러 타입 열거형
 */
export enum GeminiErrorType {
  API_KEY_INVALID = 'API_KEY_INVALID',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  CONTENT_FILTERED = 'CONTENT_FILTERED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 재시도 설정 타입
 */
export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  retryableErrors: GeminiErrorType[];
}

/**
 * 요약 데이터 타입
 */
export interface SummaryData {
  noteId: string;
  model: string;
  content: string;
  createdAt: Date;
}

/**
 * 요약 생성 요청 타입
 */
export interface SummaryRequest {
  noteId: string;
  content: string;
  userId: string;
}

/**
 * 요약 생성 응답 타입
 */
export interface SummaryResponse {
  success: boolean;
  summary?: SummaryData;
  error?: string;
}

/**
 * 태그 데이터 타입
 */
export interface TagData {
  noteId: string;
  tag: string;
  createdAt: Date;
}

/**
 * 태그 생성 요청 타입
 */
export interface TagRequest {
  noteId: string;
  content: string;
  userId: string;
}

/**
 * 태그 생성 응답 타입
 */
export interface TagResponse {
  success: boolean;
  tags?: TagData[];
  error?: string;
}