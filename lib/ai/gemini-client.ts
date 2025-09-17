// lib/ai/gemini-client.ts
// Google Gemini API 클라이언트 구현
// Gemini API와의 통신을 담당하고 에러 처리, 재시도 로직을 제공합니다
// 관련 파일: types.ts, errors.ts, config.ts, utils.ts

import { GoogleGenAI } from '@google/genai';
import { GeminiConfig, GeminiRequest, AIService, APIUsageLog } from './types';
import { createGeminiError } from './errors';
import { getGeminiConfig, logConfig } from './config';
import { 
  estimateTokens, 
  validateTokenLimit, 
  logAPIUsage, 
  withRetry, 
  truncateText 
} from './utils';

/**
 * Gemini API 클라이언트 클래스
 */
export class GeminiClient implements AIService {
  private client: GoogleGenAI;
  private config: GeminiConfig;
  private usageLogs: APIUsageLog[] = [];

  constructor(config?: Partial<GeminiConfig>) {
    try {
      this.config = { ...getGeminiConfig(), ...config };
      console.log('[Gemini Client] Config loaded:', {
        model: this.config.model,
        maxTokens: this.config.maxTokens,
        apiKeyLength: this.config.apiKey?.length || 0
      });
      
      this.client = new GoogleGenAI({ apiKey: this.config.apiKey });
      console.log('[Gemini Client] Client created successfully');
      
      // 개발 환경에서 설정 로깅
      logConfig(this.config);
    } catch (error) {
      console.error('[Gemini Client] Constructor error:', error);
      throw error;
    }
  }

  /**
   * 텍스트 생성
   */
  async generateText(prompt: string, options?: Partial<GeminiRequest>): Promise<string> {
    const startTime = Date.now();
    
    try {
      // 빈 프롬프트 검증
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('프롬프트를 입력해주세요.');
      }

      // 토큰 수 검증
      const inputTokens = estimateTokens(prompt);
      if (!validateTokenLimit(inputTokens, this.config.maxTokens)) {
        const truncatedPrompt = truncateText(prompt, this.config.maxTokens - 1000);
        console.warn('[Gemini] 입력 텍스트가 토큰 제한을 초과하여 잘렸습니다.');
        return this.generateText(truncatedPrompt, options);
      }

      // 재시도 로직과 함께 API 호출
      const result = await withRetry(
        () => this.callGeminiAPI(prompt, options),
        3,
        1000
      );

      // 사용량 로깅
      this.logUsage({
        timestamp: new Date(),
        model: this.config.model,
        inputTokens,
        outputTokens: estimateTokens(result),
        latencyMs: Date.now() - startTime,
        success: true
      });

      return result;

    } catch (error) {
      // 에러 로깅
      this.logUsage({
        timestamp: new Date(),
        model: this.config.model,
        inputTokens: estimateTokens(prompt),
        outputTokens: 0,
        latencyMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw createGeminiError(error);
    }
  }

  /**
   * 헬스체크
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.generateText('Hello', { maxTokens: 10 });
      return !!result && result.length > 0;
    } catch (error) {
      console.error('[Gemini Health Check] Failed:', error);
      return false;
    }
  }

  /**
   * 실제 Gemini API 호출
   */
  private async callGeminiAPI(prompt: string, options?: Partial<GeminiRequest>): Promise<string> {
    try {
      console.log('[Gemini API] Starting API call with model:', this.config.model);
      console.log('[Gemini API] Prompt length:', prompt.length);
      
      const result = await this.client.models.generateContent({
        model: this.config.model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: options?.maxTokens || this.config.maxTokens,
          temperature: options?.temperature || 0.7,
          topP: options?.topP || 0.8,
          topK: options?.topK || 40
        }
      });

      console.log('[Gemini API] Content generated, extracting text...');
      
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('[Gemini API] Text extracted, length:', text?.length || 0);

      if (!text || text.trim().length === 0) {
        throw new Error('API 응답에서 텍스트를 가져올 수 없습니다.');
      }

      return text;
    } catch (error) {
      console.error('[Gemini API] Call failed:', error);
      console.error('[Gemini API] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // API 에러 타입별 처리
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Gemini API 키가 유효하지 않습니다.');
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API 사용량이 초과되었습니다.');
        }
        if (error.message.includes('SAFETY')) {
          throw new Error('콘텐츠가 안전 정책에 위배됩니다.');
        }
        if (error.message.includes('timeout')) {
          throw new Error('API 요청 시간이 초과되었습니다.');
        }
      }
      
      throw error;
    }
  }

  /**
   * 사용량 로깅
   */
  private logUsage(log: APIUsageLog): void {
    this.usageLogs.push(log);
    logAPIUsage(log);
    
    // 메모리 관리를 위해 오래된 로그 제거 (최근 1000개만 유지)
    if (this.usageLogs.length > 1000) {
      this.usageLogs = this.usageLogs.slice(-1000);
    }
  }

  /**
   * 사용량 통계 조회
   */
  getUsageStats() {
    return {
      totalRequests: this.usageLogs.length,
      recentRequests: this.usageLogs.slice(-100), // 최근 100개 요청
      errorRate: this.calculateErrorRate(),
      averageLatency: this.calculateAverageLatency()
    };
  }

  /**
   * 에러율 계산
   */
  private calculateErrorRate(): number {
    if (this.usageLogs.length === 0) return 0;
    
    const failedRequests = this.usageLogs.filter(log => !log.success).length;
    return (failedRequests / this.usageLogs.length) * 100;
  }

  /**
   * 평균 응답 시간 계산
   */
  private calculateAverageLatency(): number {
    if (this.usageLogs.length === 0) return 0;
    
    const totalLatency = this.usageLogs.reduce((sum, log) => sum + log.latencyMs, 0);
    return totalLatency / this.usageLogs.length;
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logConfig(this.config);
  }

  /**
   * 사용량 로그 초기화
   */
  clearUsageLogs(): void {
    this.usageLogs = [];
  }
}

/**
 * 싱글톤 인스턴스 생성
 */
let geminiClientInstance: GeminiClient | null = null;

/**
 * Gemini 클라이언트 인스턴스 가져오기
 */
export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    geminiClientInstance = new GeminiClient();
  }
  return geminiClientInstance;
}

/**
 * Gemini 클라이언트 인스턴스 재설정
 */
export function resetGeminiClient(): void {
  geminiClientInstance = null;
}
