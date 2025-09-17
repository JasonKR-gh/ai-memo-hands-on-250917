// __tests__/ai/summary-generation.test.ts
// 요약 생성 기능 테스트
// AI 요약 생성 서버 액션과 관련 기능들을 테스트합니다
// 관련 파일: lib/ai/actions.ts, lib/notes/queries.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateSummaryAction, getSummaryAction } from '@/lib/ai/actions'
import { createOrUpdateSummary } from '@/lib/notes/queries'

// 모킹 설정
vi.mock('@/lib/ai/gemini-client', () => ({
  getGeminiClient: vi.fn(() => ({
    generateText: vi.fn()
  }))
}))

vi.mock('@/lib/notes/queries', () => ({
  getNoteById: vi.fn(),
  createOrUpdateSummary: vi.fn(),
  getSummaryByNoteId: vi.fn()
}))

vi.mock('@/lib/db/connection', () => ({
  db: {}
}))

// 타입 정의
type MockFunction = ReturnType<typeof vi.fn>

describe('Summary Generation', () => {
  const mockNote = {
    id: 'test-note-id',
    userId: 'test-user-id',
    title: 'Test Note',
    content: 'This is a test note content for summarization.',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockSummary = {
    id: 'test-summary-id',
    noteId: 'test-note-id',
    model: 'gemini-1.5-flash',
    content: '• Test summary point 1\n• Test summary point 2\n• Test summary point 3',
    createdAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateSummaryAction', () => {
    it('should generate summary successfully', async () => {
      // Given
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('• Test summary point 1\n• Test summary point 2\n• Test summary point 3')
      }
      ;(getGeminiClient as MockFunction).mockReturnValue(mockClient)
      ;(getNoteById as MockFunction).mockResolvedValue(mockNote)
      ;(createOrUpdateSummary as MockFunction).mockResolvedValue(mockSummary)

      // When
      const result = await generateSummaryAction(
        'test-note-id',
        'This is a test note content for summarization.',
        'test-user-id'
      )

      // Then
      expect(result.success).toBe(true)
      expect(result.summary).toBeDefined()
      expect(result.summary?.noteId).toBe('test-note-id')
      expect(result.summary?.content).toContain('Test summary point')
      expect(mockClient.generateText).toHaveBeenCalledWith(
        expect.stringContaining('다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요'),
        { maxTokens: 1000, temperature: 0.3 }
      )
    })

    it('should return error when note not found', async () => {
      // Given
      const { getNoteById } = await import('@/lib/notes/queries')
      ;(getNoteById as MockFunction).mockResolvedValue(null)

      // When
      const result = await generateSummaryAction(
        'invalid-note-id',
        'Test content',
        'test-user-id'
      )

      // Then
      expect(result.success).toBe(false)
      expect(result.error).toBe('노트를 찾을 수 없거나 접근 권한이 없습니다.')
    })

    it('should return error when content is too long', async () => {
      // Given
      const longContent = 'a'.repeat(40000) // 10k+ tokens
      const { getNoteById } = await import('@/lib/notes/queries')
      ;(getNoteById as MockFunction).mockResolvedValue(mockNote)

      // When
      const result = await generateSummaryAction(
        'test-note-id',
        longContent,
        'test-user-id'
      )

      // Then
      expect(result.success).toBe(false)
      expect(result.error).toBe('노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.')
    })

    it('should return error when Gemini API fails', async () => {
      // Given
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockRejectedValue(new Error('API Error'))
      }
      ;(getGeminiClient as MockFunction).mockReturnValue(mockClient)
      ;(getNoteById as MockFunction).mockResolvedValue(mockNote)

      // When
      const result = await generateSummaryAction(
        'test-note-id',
        'Test content',
        'test-user-id'
      )

      // Then
      expect(result.success).toBe(false)
      expect(result.error).toBe('요약 생성 중 오류가 발생했습니다.')
    })

    it('should return error when summary content is empty', async () => {
      // Given
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('')
      }
      ;(getGeminiClient as MockFunction).mockReturnValue(mockClient)
      ;(getNoteById as MockFunction).mockResolvedValue(mockNote)

      // When
      const result = await generateSummaryAction(
        'test-note-id',
        'Test content',
        'test-user-id'
      )

      // Then
      expect(result.success).toBe(false)
      expect(result.error).toBe('요약 생성에 실패했습니다.')
    })

    it('should validate required parameters', async () => {
      // When
      const result1 = await generateSummaryAction('', 'content', 'user')
      const result2 = await generateSummaryAction('note', '', 'user')
      const result3 = await generateSummaryAction('note', 'content', '')

      // Then
      expect(result1.success).toBe(false)
      expect(result1.error).toBe('필수 파라미터가 누락되었습니다.')
      expect(result2.success).toBe(false)
      expect(result2.error).toBe('필수 파라미터가 누락되었습니다.')
      expect(result3.success).toBe(false)
      expect(result3.error).toBe('필수 파라미터가 누락되었습니다.')
    })
  })

  describe('getSummaryAction', () => {
    it('should retrieve summary successfully', async () => {
      // Given
      const { getSummaryByNoteId } = await import('@/lib/notes/queries')
      ;(getSummaryByNoteId as MockFunction).mockResolvedValue(mockSummary)

      // When
      const result = await getSummaryAction('test-note-id', 'test-user-id')

      // Then
      expect(result.success).toBe(true)
      expect(result.summary).toBeDefined()
      expect(result.summary?.noteId).toBe('test-note-id')
      expect(result.summary?.content).toBe(mockSummary.content)
    })

    it('should return error when summary not found', async () => {
      // Given
      const { getSummaryByNoteId } = await import('@/lib/notes/queries')
      ;(getSummaryByNoteId as MockFunction).mockResolvedValue(null)

      // When
      const result = await getSummaryAction('test-note-id', 'test-user-id')

      // Then
      expect(result.success).toBe(false)
      expect(result.error).toBe('요약을 찾을 수 없습니다.')
    })

    it('should validate required parameters', async () => {
      // When
      const result1 = await getSummaryAction('', 'user')
      const result2 = await getSummaryAction('note', '')

      // Then
      expect(result1.success).toBe(false)
      expect(result1.error).toBe('필수 파라미터가 누락되었습니다.')
      expect(result2.success).toBe(false)
      expect(result2.error).toBe('필수 파라미터가 누락되었습니다.')
    })

    it('should handle database errors', async () => {
      // Given
      const { getSummaryByNoteId } = await import('@/lib/notes/queries')
      ;(getSummaryByNoteId as MockFunction).mockRejectedValue(new Error('Database error'))

      // When
      const result = await getSummaryAction('test-note-id', 'test-user-id')

      // Then
      expect(result.success).toBe(false)
      expect(result.error).toBe('요약 조회 중 오류가 발생했습니다.')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete summary workflow', async () => {
      // Given
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById, getSummaryByNoteId } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('• Integration test summary')
      }
      ;(getGeminiClient as MockFunction).mockReturnValue(mockClient)
      ;(getNoteById as MockFunction).mockResolvedValue(mockNote)
      ;(createOrUpdateSummary as MockFunction).mockResolvedValue(mockSummary)
      ;(getSummaryByNoteId as MockFunction).mockResolvedValue(mockSummary)

      // When - Generate summary
      const generateResult = await generateSummaryAction(
        'test-note-id',
        'Test content for integration',
        'test-user-id'
      )

      // Then - Generate should succeed
      expect(generateResult.success).toBe(true)
      expect(generateResult.summary).toBeDefined()

      // When - Retrieve summary
      const getResult = await getSummaryAction('test-note-id', 'test-user-id')

      // Then - Retrieve should succeed
      expect(getResult.success).toBe(true)
      expect(getResult.summary).toBeDefined()
      expect(getResult.summary?.content).toBe(mockSummary.content)
    })
  })
})
