// lib/ai/actions.ts
// AI 서비스 서버 액션
// 클라이언트에서 호출할 수 있는 AI 관련 서버 액션들을 제공합니다
// 관련 파일: gemini-client.ts, types.ts

'use server';

import { getGeminiClient } from './gemini-client';
import { GeminiError } from './errors';
import { SummaryResponse, SummaryData, TagResponse, TagData } from './types';
import { createOrUpdateSummary, getSummaryByNoteId, deleteSummary, createOrUpdateTags, getTagsByNoteId } from '@/lib/notes/queries';
import { getNoteById } from '@/lib/notes/queries';
import { getGeminiConfig } from './config';

/**
 * 기본 텍스트 생성 액션
 */
export async function generateTextAction(prompt: string): Promise<{
  success: boolean;
  text?: string;
  error?: string;
}> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      return {
        success: false,
        error: '프롬프트를 입력해주세요.'
      };
    }

    const client = getGeminiClient();
    const text = await client.generateText(prompt);

    return {
      success: true,
      text
    };
  } catch (error) {
    console.error('[AI Action] Text generation failed:', error);
    
    if (error instanceof GeminiError) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: '텍스트 생성 중 오류가 발생했습니다.'
    };
  }
}

/**
 * AI 서비스 헬스체크 액션
 */
export async function healthCheckAction(): Promise<{
  success: boolean;
  isHealthy?: boolean;
  error?: string;
}> {
  try {
    const client = getGeminiClient();
    const isHealthy = await client.healthCheck();

    return {
      success: true,
      isHealthy
    };
  } catch (error) {
    console.error('[AI Action] Health check failed:', error);
    
    return {
      success: false,
      error: '헬스체크 중 오류가 발생했습니다.'
    };
  }
}

/**
 * AI 서비스 사용량 통계 조회 액션
 */
export async function getUsageStatsAction(): Promise<{
  success: boolean;
  stats?: {
    totalRequests: number;
    errorRate: number;
    averageLatency: number;
  };
  error?: string;
}> {
  try {
    const client = getGeminiClient();
    const stats = client.getUsageStats();

    return {
      success: true,
      stats: {
        totalRequests: stats.totalRequests,
        errorRate: stats.errorRate,
        averageLatency: stats.averageLatency
      }
    };
  } catch (error) {
    console.error('[AI Action] Usage stats failed:', error);
    
    return {
      success: false,
      error: '사용량 통계 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 노트 요약 생성 액션 (향후 확장용)
 */
export async function summarizeNoteAction(content: string): Promise<{
  success: boolean;
  summary?: string;
  error?: string;
}> {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '요약할 내용을 입력해주세요.'
      };
    }

    const prompt = `다음 노트 내용을 3-5문장으로 요약해주세요:\n\n${content}`;
    const client = getGeminiClient();
    const summary = await client.generateText(prompt, { maxTokens: 500 });

    return {
      success: true,
      summary
    };
  } catch (error) {
    console.error('[AI Action] Note summarization failed:', error);
    
    if (error instanceof GeminiError) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: '노트 요약 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 노트 태그 생성 액션
 */
export async function generateTagsAction(
  noteId: string,
  content: string,
  userId: string
): Promise<TagResponse> {
  try {
    // 입력 검증
    if (!noteId || !content || !userId) {
      return {
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      };
    }

    // 노트 소유권 확인
    const note = await getNoteById(noteId, userId);
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 접근 권한이 없습니다.'
      };
    }

    // 토큰 제한 검사 (8k 토큰)
    const estimatedTokens = Math.ceil(content.length / 4); // 대략적인 토큰 계산
    if (estimatedTokens > 8000) {
      return {
        success: false,
        error: '노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.'
      };
    }

    // 태그 프롬프트 생성
    const prompt = `다음 노트 내용을 분석하여 최대 6개의 관련성 높은 태그를 생성해주세요. 태그는 쉼표로 구분하여 한 줄로 출력해주세요:\n\n${content}`;

    // Gemini API 호출
    console.log('[AI Action] Calling Gemini API for tags with prompt length:', prompt.length);
    const client = getGeminiClient();
    const response = await client.generateText(prompt, { 
      maxTokens: 200,
      temperature: 0.3 // 일관된 태그를 위해 낮은 온도 설정
    });
    console.log('[AI Action] Gemini API response for tags:', response);

    // 응답에서 태그 추출
    const tags = response
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 6); // 최대 6개 태그

    if (tags.length === 0) {
      return {
        success: false,
        error: '태그 생성에 실패했습니다.'
      };
    }

    // 데이터베이스에 태그 저장/업데이트
    const tagData = await createOrUpdateTags(noteId, tags);

    const tagResults: TagData[] = tagData.map(tag => ({
      noteId: tag.noteId,
      tag: tag.tag,
      createdAt: tag.createdAt || new Date()
    }));

    return {
      success: true,
      tags: tagResults
    };

  } catch (error) {
    console.error('[AI Action] Tag generation failed:', error);
    
    // 더 구체적인 에러 메시지 제공
    if (error instanceof GeminiError) {
      return {
        success: false,
        error: `AI 서비스 오류: ${error.message}`
      };
    }

    // 일반적인 에러 타입별 처리
    if (error instanceof Error) {
      console.error('[AI Action] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // 네트워크 관련 에러
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          success: false,
          error: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        };
      }
      
      // API 키 관련 에러
      if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
        return {
          success: false,
          error: 'AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.'
        };
      }
      
      // 토큰 제한 관련 에러
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return {
          success: false,
          error: 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        };
      }
      
      return {
        success: false,
        error: `태그 생성 중 오류가 발생했습니다: ${error.message}`
      };
    }

    return {
      success: false,
      error: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 노트 태그 생성 액션 (테스트용 - 노트 검증 우회)
 */
export async function generateTagsTestAction(content: string): Promise<TagResponse> {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '태그를 생성할 내용을 입력해주세요.'
      };
    }

    // 토큰 제한 검사 (8k 토큰)
    const estimatedTokens = Math.ceil(content.length / 4);
    if (estimatedTokens > 8000) {
      return {
        success: false,
        error: '노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.'
      };
    }

    const prompt = `다음 노트 내용을 분석하여 최대 6개의 관련성 높은 태그를 생성해주세요. 태그는 쉼표로 구분하여 한 줄로 출력해주세요:\n\n${content}`;
    const client = getGeminiClient();
    const response = await client.generateText(prompt, { 
      maxTokens: 200,
      temperature: 0.3
    });
    
    // 응답에서 태그 추출
    const tags = response
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 6);

    if (tags.length === 0) {
      return {
        success: false,
        error: '태그 생성에 실패했습니다.'
      };
    }

    // 테스트용이므로 데이터베이스 저장 없이 결과만 반환
    const tagResults: TagData[] = tags.map(tag => ({
      noteId: 'test-note-id',
      tag: tag,
      createdAt: new Date()
    }));

    return {
      success: true,
      tags: tagResults
    };
  } catch (error) {
    console.error('[AI Action] Tag generation failed:', error);
    
    if (error instanceof GeminiError) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: '태그 생성 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 노트 태그 조회 액션
 */
export async function getTagsAction(
  noteId: string,
  userId: string
): Promise<TagResponse> {
  try {
    // 입력 검증
    if (!noteId || !userId) {
      return {
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      };
    }

    // 태그 조회
    const tagData = await getTagsByNoteId(noteId, userId);
    
    const tags: TagData[] = tagData.map(tag => ({
      noteId: tag.noteId,
      tag: tag.tag,
      createdAt: tag.createdAt || new Date()
    }));

    return {
      success: true,
      tags
    };

  } catch (error) {
    console.error('[AI Action] Tag retrieval failed:', error);
    
    return {
      success: false,
      error: '태그 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 노트 요약 생성 액션
 */
export async function generateSummaryAction(
  noteId: string,
  content: string,
  userId: string
): Promise<SummaryResponse> {
  try {
    // 입력 검증
    if (!noteId || !content || !userId) {
      return {
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      };
    }

    // 노트 소유권 확인
    const note = await getNoteById(noteId, userId);
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 접근 권한이 없습니다.'
      };
    }

    // 토큰 제한 검사 (8k 토큰)
    const estimatedTokens = Math.ceil(content.length / 4); // 대략적인 토큰 계산
    if (estimatedTokens > 8000) {
      return {
        success: false,
        error: '노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.'
      };
    }

    // 요약 프롬프트 생성
    const prompt = `다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요. 각 불릿 포인트는 핵심 내용을 간결하게 표현해야 합니다:\n\n${content}`;

    // Gemini API 호출
    console.log('[AI Action] Calling Gemini API with prompt length:', prompt.length);
    const client = getGeminiClient();
    const summaryText = await client.generateText(prompt, { 
      maxTokens: 1000,
      temperature: 0.3 // 일관된 요약을 위해 낮은 온도 설정
    });
    console.log('[AI Action] Gemini API response length:', summaryText?.length || 0);

    // 요약 내용 검증
    if (!summaryText || summaryText.trim().length === 0) {
      return {
        success: false,
        error: '요약 생성에 실패했습니다.'
      };
    }

    // 데이터베이스에 요약 저장/업데이트
    const summaryData = await createOrUpdateSummary(
      noteId,
      'gemini-2.0-flash-001',
      summaryText.trim()
    );

    const summary: SummaryData = {
      noteId: summaryData.noteId,
      model: summaryData.model,
      content: summaryData.content,
      createdAt: summaryData.createdAt || new Date()
    };

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error('[AI Action] Summary generation failed:', error);
    
    // 더 구체적인 에러 메시지 제공
    if (error instanceof GeminiError) {
      return {
        success: false,
        error: `AI 서비스 오류: ${error.message}`
      };
    }

    // 일반적인 에러 타입별 처리
    if (error instanceof Error) {
      console.error('[AI Action] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // 네트워크 관련 에러
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          success: false,
          error: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        };
      }
      
      // API 키 관련 에러
      if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
        return {
          success: false,
          error: 'AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.'
        };
      }
      
      // 토큰 제한 관련 에러
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return {
          success: false,
          error: 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        };
      }
      
      return {
        success: false,
        error: `요약 생성 중 오류가 발생했습니다: ${error.message}`
      };
    }

    return {
      success: false,
      error: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 노트 요약 생성 액션 (테스트용 - 노트 검증 우회)
 */
export async function generateSummaryTestAction(
  content: string
): Promise<SummaryResponse> {
  try {
    // 입력 검증
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '요약할 내용을 입력해주세요.'
      };
    }

    // 토큰 제한 검사 (8k 토큰)
    const estimatedTokens = Math.ceil(content.length / 4); // 대략적인 토큰 계산
    if (estimatedTokens > 8000) {
      return {
        success: false,
        error: '노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.'
      };
    }

    // 요약 프롬프트 생성
    const prompt = `다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요. 각 불릿 포인트는 핵심 내용을 간결하게 표현해야 합니다:\n\n${content}`;

    // Gemini API 호출
    console.log('[AI Action] Calling Gemini API with prompt length:', prompt.length);
    const client = getGeminiClient();
    const summaryText = await client.generateText(prompt, { 
      maxTokens: 1000,
      temperature: 0.3 // 일관된 요약을 위해 낮은 온도 설정
    });
    console.log('[AI Action] Gemini API response length:', summaryText?.length || 0);

    // 요약 내용 검증
    if (!summaryText || summaryText.trim().length === 0) {
      return {
        success: false,
        error: '요약 생성에 실패했습니다.'
      };
    }

    // 테스트용이므로 데이터베이스 저장 없이 결과만 반환
    const summary: SummaryData = {
      noteId: 'test-note-id',
      model: 'gemini-2.0-flash-001',
      content: summaryText.trim(),
      createdAt: new Date()
    };

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error('[AI Action] Summary generation failed:', error);
    
    // 더 구체적인 에러 메시지 제공
    if (error instanceof GeminiError) {
      return {
        success: false,
        error: `AI 서비스 오류: ${error.message}`
      };
    }

    // 일반적인 에러 타입별 처리
    if (error instanceof Error) {
      console.error('[AI Action] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // 네트워크 관련 에러
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          success: false,
          error: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
        };
      }
      
      // API 키 관련 에러
      if (error.message.includes('API_KEY') || error.message.includes('authentication')) {
        return {
          success: false,
          error: 'AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.'
        };
      }
      
      // 토큰 제한 관련 에러
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return {
          success: false,
          error: 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        };
      }
      
      return {
        success: false,
        error: `요약 생성 중 오류가 발생했습니다: ${error.message}`
      };
    }

    return {
      success: false,
      error: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
}

/**
 * 노트 요약 조회 액션
 */
export async function getSummaryAction(
  noteId: string,
  userId: string
): Promise<SummaryResponse> {
  try {
    // 입력 검증
    if (!noteId || !userId) {
      return {
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      };
    }

    // 요약 조회
    const summaryData = await getSummaryByNoteId(noteId, userId);
    
    if (!summaryData) {
      return {
        success: false,
        error: '요약을 찾을 수 없습니다.'
      };
    }

    const summary: SummaryData = {
      noteId: summaryData.noteId,
      model: summaryData.model,
      content: summaryData.content,
      createdAt: summaryData.createdAt || new Date()
    };

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error('[AI Action] Summary retrieval failed:', error);
    
    return {
      success: false,
      error: '요약 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 요약 수동 편집 액션
 */
export async function updateSummaryAction(
  noteId: string,
  content: string,
  userId: string
): Promise<SummaryResponse> {
  try {
    // 입력 검증
    if (!noteId || !content || !userId) {
      return {
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      };
    }

    // 노트 소유권 확인
    const note = await getNoteById(noteId, userId);
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 접근 권한이 없습니다.'
      };
    }

    // 요약 내용 검증
    if (content.trim().length === 0) {
      return {
        success: false,
        error: '요약 내용을 입력해주세요.'
      };
    }

    // 데이터베이스에 요약 업데이트
    const summaryData = await createOrUpdateSummary(
      noteId,
      'manual-edit',
      content.trim()
    );

    const summary: SummaryData = {
      noteId: summaryData.noteId,
      model: summaryData.model,
      content: summaryData.content,
      createdAt: summaryData.createdAt || new Date()
    };

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error('[AI Action] Summary update failed:', error);
    
    return {
      success: false,
      error: '요약 수정 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 태그 수동 편집 액션
 */
export async function updateTagsAction(
  noteId: string,
  tags: string[],
  userId: string
): Promise<TagResponse> {
  try {
    // 입력 검증
    if (!noteId || !userId) {
      return {
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      };
    }

    // 노트 소유권 확인
    const note = await getNoteById(noteId, userId);
    if (!note) {
      return {
        success: false,
        error: '노트를 찾을 수 없거나 접근 권한이 없습니다.'
      };
    }

    // 태그 검증 및 정리
    const validTags = tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // 최대 10개 태그로 제한

    // 데이터베이스에 태그 업데이트
    const tagData = await createOrUpdateTags(noteId, validTags);

    const tagResults: TagData[] = tagData.map(tag => ({
      noteId: tag.noteId,
      tag: tag.tag,
      createdAt: tag.createdAt || new Date()
    }));

    return {
      success: true,
      tags: tagResults
    };

  } catch (error) {
    console.error('[AI Action] Tags update failed:', error);
    
    return {
      success: false,
      error: '태그 수정 중 오류가 발생했습니다.'
    };
  }
}

/**
 * AI 서비스 전체 헬스체크 액션
 */
export async function healthCheckFullAction(): Promise<{
  success: boolean;
  checks: {
    gemini: boolean;
    database: boolean;
    config: boolean;
  };
  error?: string;
}> {
  const checks = {
    gemini: false,
    database: false,
    config: false
  };

  try {
    // 1. 설정 확인
    try {
      const config = getGeminiConfig();
      checks.config = !!config.apiKey && !!config.model;
      console.log('[Health Check] Config:', checks.config);
    } catch (error) {
      console.error('[Health Check] Config failed:', error);
    }

    // 2. Gemini API 확인
    try {
      const client = getGeminiClient();
      const isHealthy = await client.healthCheck();
      checks.gemini = isHealthy;
      console.log('[Health Check] Gemini:', checks.gemini);
    } catch (error) {
      console.error('[Health Check] Gemini failed:', error);
    }

    // 3. 데이터베이스 확인
    try {
      const testSummary = await createOrUpdateSummary(
        'health-check-note',
        'gemini-1.5-flash',
        'Health check test'
      );
      checks.database = !!testSummary;
      console.log('[Health Check] Database:', checks.database);
      
      // 테스트 데이터 정리
      await deleteSummary('health-check-note');
    } catch (error) {
      console.error('[Health Check] Database failed:', error);
    }

    const allHealthy = Object.values(checks).every(check => check);

    return {
      success: allHealthy,
      checks,
      error: allHealthy ? undefined : '일부 서비스에 문제가 있습니다.'
    };

  } catch (error) {
    console.error('[Health Check] Full check failed:', error);
    return {
      success: false,
      checks,
      error: `헬스체크 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
}
