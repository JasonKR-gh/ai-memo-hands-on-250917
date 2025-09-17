// __tests__/ai/gemini-client.test.ts
// Gemini API 클라이언트 테스트
// 클라이언트의 기본 기능과 에러 처리를 테스트합니다
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/types.ts

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeminiClient } from '../../lib/ai/gemini-client';

// 환경변수 모킹
const mockEnv = {
  GEMINI_API_KEY: 'test-api-key',
  GEMINI_MODEL: 'gemini-2.0-flash-001',
  GEMINI_MAX_TOKENS: '8192',
  GEMINI_TIMEOUT_MS: '10000',
  GEMINI_DEBUG: 'true',
  GEMINI_RATE_LIMIT: '60',
  NODE_ENV: 'test'
};

describe('GeminiClient', () => {
  let client: GeminiClient;

  beforeEach(() => {
    // 환경변수 모킹
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
    
    // GoogleGenAI 모킹
    vi.mock('@google/genai', () => ({
      GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: 'Test response'
          })
        }
      }))
    }));

    client = new GeminiClient();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  test('should initialize with correct config', () => {
    expect(client).toBeDefined();
    const stats = client.getUsageStats();
    expect(stats.totalRequests).toBe(0);
  });

  test('should generate text successfully', async () => {
    const result = await client.generateText('Hello, world!');
    expect(result).toBe('Test response');
    
    const stats = client.getUsageStats();
    expect(stats.totalRequests).toBe(1);
  });

  test('should handle API errors gracefully', async () => {
    // 빈 프롬프트로 에러 테스트
    await expect(client.generateText('')).rejects.toThrow();
  });

  test('should perform health check', async () => {
    const isHealthy = await client.healthCheck();
    expect(isHealthy).toBe(true);
  });

  test('should track usage statistics', async () => {
    await client.generateText('Test prompt 1');
    await client.generateText('Test prompt 2');
    
    const stats = client.getUsageStats();
    expect(stats.totalRequests).toBe(2);
    expect(stats.averageLatency).toBeGreaterThanOrEqual(0);
  });

  test('should clear usage logs', async () => {
    await client.generateText('Test prompt');
    expect(client.getUsageStats().totalRequests).toBe(1);
    
    client.clearUsageLogs();
    expect(client.getUsageStats().totalRequests).toBe(0);
  });

  test('should update config', () => {
    const newConfig = { maxTokens: 4096 };
    client.updateConfig(newConfig);
    
    // 설정이 업데이트되었는지 확인 (내부적으로 검증)
    expect(() => client.updateConfig({ maxTokens: 50000 })).not.toThrow();
  });
});

describe('GeminiClient Error Handling', () => {
  let client: GeminiClient;

  beforeEach(() => {
    // 환경변수 모킹
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
    
    // GoogleGenAI 모킹
    vi.mock('@google/genai', () => ({
      GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: 'Test response'
          })
        }
      }))
    }));

    client = new GeminiClient();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  test('should handle empty prompt', async () => {
    await expect(client.generateText('')).rejects.toThrow();
  });

  test('should handle very long prompt', async () => {
    const longPrompt = 'a'.repeat(100000); // 매우 긴 프롬프트
    await expect(client.generateText(longPrompt)).resolves.toBeDefined();
  });
});
