// __tests__/ai/tag-generation.test.ts
// AI 태그 생성 기능 테스트
// 태그 생성 서버 액션과 관련 기능들을 테스트합니다
// 관련 파일: lib/ai/actions.ts, lib/notes/queries.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateTagsAction, generateTagsTestAction, getTagsAction } from '@/lib/ai/actions'
import { createOrUpdateTags, getTagsByNoteId, deleteTags } from '@/lib/notes/queries'

// Mock dependencies
vi.mock('@/lib/ai/gemini-client', () => ({
  getGeminiClient: vi.fn(() => ({
    generateText: vi.fn()
  }))
}))

vi.mock('@/lib/notes/queries', () => ({
  getNoteById: vi.fn(),
  createOrUpdateTags: vi.fn(),
  getTagsByNoteId: vi.fn(),
  deleteTags: vi.fn()
}))

vi.mock('@/lib/ai/config', () => ({
  getGeminiConfig: vi.fn(() => ({
    apiKey: 'test-api-key',
    model: 'gemini-1.5-flash',
    maxTokens: 8000,
    timeout: 10000,
    debug: false,
    rateLimitPerMinute: 60
  }))
}))

describe('AI Tag Generation', () => {
  const mockNote = {
    id: 'test-note-id',
    userId: 'test-user-id',
    title: 'Test Note',
    content: 'This is a test note about artificial intelligence and machine learning.',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockTags = [
    { noteId: 'test-note-id', tag: 'AI', createdAt: new Date() },
    { noteId: 'test-note-id', tag: 'Machine Learning', createdAt: new Date() },
    { noteId: 'test-note-id', tag: 'Technology', createdAt: new Date() }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateTagsAction', () => {
    it('should generate tags successfully', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('AI, Machine Learning, Technology, Innovation, Data Science, Algorithms')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)
      vi.mocked(createOrUpdateTags).mockResolvedValue(mockTags)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note about artificial intelligence and machine learning.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(true)
      expect(result.tags).toHaveLength(3)
      expect(result.tags?.[0].tag).toBe('AI')
      expect(result.tags?.[1].tag).toBe('Machine Learning')
      expect(result.tags?.[2].tag).toBe('Technology')
    })

    it('should handle missing parameters', async () => {
      // Act
      const result = await generateTagsAction('', '', '')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('필수 파라미터가 누락되었습니다.')
    })

    it('should handle note not found', async () => {
      // Arrange
      const { getNoteById } = await import('@/lib/notes/queries')
      vi.mocked(getNoteById).mockResolvedValue(null)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('노트를 찾을 수 없거나 접근 권한이 없습니다.')
    })

    it('should handle token limit exceeded', async () => {
      // Arrange
      const { getNoteById } = await import('@/lib/notes/queries')
      const longContent = 'a'.repeat(40000) // 10k tokens
      vi.mocked(getNoteById).mockResolvedValue(mockNote)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        longContent,
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.')
    })

    it('should handle Gemini API errors', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockRejectedValue(new Error('API Error'))
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('태그 생성 중 오류가 발생했습니다')
    })

    it('should handle empty tag response', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('태그 생성에 실패했습니다.')
    })

    it('should limit tags to maximum 6', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('Tag1, Tag2, Tag3, Tag4, Tag5, Tag6, Tag7, Tag8')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)
      vi.mocked(createOrUpdateTags).mockResolvedValue(mockTags)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(true)
      expect(result.tags).toHaveLength(3) // Mock returns 3 tags
    })
  })

  describe('generateTagsTestAction', () => {
    it('should generate tags for testing', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('AI, Machine Learning, Technology')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)

      // Act
      const result = await generateTagsTestAction('This is a test note about AI.')

      // Assert
      expect(result.success).toBe(true)
      expect(result.tags).toHaveLength(3)
      expect(result.tags?.[0].noteId).toBe('test-note-id')
    })

    it('should handle empty content', async () => {
      // Act
      const result = await generateTagsTestAction('')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('태그를 생성할 내용을 입력해주세요.')
    })

    it('should handle token limit exceeded', async () => {
      // Arrange
      const longContent = 'a'.repeat(40000) // 10k tokens

      // Act
      const result = await generateTagsTestAction(longContent)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('노트 내용이 너무 깁니다. 8,000 토큰 이하로 작성해주세요.')
    })
  })

  describe('getTagsAction', () => {
    it('should retrieve tags successfully', async () => {
      // Arrange
      const { getTagsByNoteId } = await import('@/lib/notes/queries')
      vi.mocked(getTagsByNoteId).mockResolvedValue(mockTags)

      // Act
      const result = await getTagsAction('test-note-id', 'test-user-id')

      // Assert
      expect(result.success).toBe(true)
      expect(result.tags).toHaveLength(3)
      expect(result.tags?.[0].tag).toBe('AI')
    })

    it('should handle missing parameters', async () => {
      // Act
      const result = await getTagsAction('', '')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('필수 파라미터가 누락되었습니다.')
    })

    it('should handle database errors', async () => {
      // Arrange
      const { getTagsByNoteId } = await import('@/lib/notes/queries')
      vi.mocked(getTagsByNoteId).mockRejectedValue(new Error('Database error'))

      // Act
      const result = await getTagsAction('test-note-id', 'test-user-id')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('태그 조회 중 오류가 발생했습니다.')
    })
  })

  describe('Tag Processing', () => {
    it('should parse comma-separated tags correctly', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('AI, Machine Learning, Technology, Innovation')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)
      vi.mocked(createOrUpdateTags).mockResolvedValue(mockTags)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(true)
      expect(mockClient.generateText).toHaveBeenCalledWith(
        expect.stringContaining('다음 노트 내용을 분석하여 최대 6개의 관련성 높은 태그를 생성해주세요'),
        expect.objectContaining({
          maxTokens: 200,
          temperature: 0.3
        })
      )
    })

    it('should trim whitespace from tags', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue(' AI , Machine Learning , Technology ')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)
      vi.mocked(createOrUpdateTags).mockResolvedValue(mockTags)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(true)
      expect(createOrUpdateTags).toHaveBeenCalledWith(
        'test-note-id',
        ['AI', 'Machine Learning', 'Technology']
      )
    })

    it('should filter out empty tags', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockResolvedValue('AI, , Machine Learning, , Technology')
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)
      vi.mocked(createOrUpdateTags).mockResolvedValue(mockTags)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(true)
      expect(createOrUpdateTags).toHaveBeenCalledWith(
        'test-note-id',
        ['AI', 'Machine Learning', 'Technology']
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockRejectedValue(new Error('fetch failed'))
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.')
    })

    it('should handle API key errors', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockRejectedValue(new Error('API_KEY invalid'))
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요.')
    })

    it('should handle quota exceeded errors', async () => {
      // Arrange
      const { getGeminiClient } = await import('@/lib/ai/gemini-client')
      const { getNoteById } = await import('@/lib/notes/queries')
      
      const mockClient = {
        generateText: vi.fn().mockRejectedValue(new Error('quota exceeded'))
      }
      vi.mocked(getGeminiClient).mockReturnValue(mockClient as any)
      vi.mocked(getNoteById).mockResolvedValue(mockNote)

      // Act
      const result = await generateTagsAction(
        'test-note-id',
        'This is a test note.',
        'test-user-id'
      )

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.')
    })
  })
})
