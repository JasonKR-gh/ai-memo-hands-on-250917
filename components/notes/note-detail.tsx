// components/notes/note-detail.tsx
// 노트 상세 표시 및 편집 컴포넌트
// 개별 노트의 상세 내용을 표시하고 편집할 수 있는 재사용 가능한 컴포넌트
// 관련 파일: app/notes/[id]/page.tsx, components/ui/card.tsx, lib/notes/actions.ts

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react'
import Link from 'next/link'
import { updateNoteAction } from '@/lib/notes/actions'
import { generateSummaryAction, getSummaryAction, generateTagsAction, getTagsAction, updateSummaryAction, updateTagsAction } from '@/lib/ai/actions'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { ExportButton } from './export-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface NoteDetailProps {
  note: {
    id: string
    userId: string
    title: string
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type SummaryStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'editing'
type TagStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'editing'

interface SummaryData {
  noteId: string
  model: string
  content: string
  createdAt: Date
}

interface TagData {
  noteId: string
  tag: string
  createdAt: Date
}

export function NoteDetail({ note }: NoteDetailProps) {
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title)
  const [editContent, setEditContent] = useState(note.content || '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  
  // 삭제 다이얼로그 상태
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // 요약 관련 상태
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>('idle')
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [editSummary, setEditSummary] = useState('')
  
  // 태그 관련 상태
  const [tagStatus, setTagStatus] = useState<TagStatus>('idle')
  const [tags, setTags] = useState<TagData[]>([])
  const [tagError, setTagError] = useState<string | null>(null)
  const [editTags, setEditTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  
  // 원본 데이터 백업
  const [originalData, setOriginalData] = useState({
    title: note.title,
    content: note.content || ''
  })
  
  // 저장 중 상태를 추가로 관리
  const [isSaving, setIsSaving] = useState(false)
  
  // 디바운스 타이머
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  
  // 변경사항 감지
  const hasChanges = editTitle !== originalData.title || editContent !== originalData.content

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpdated = note.updatedAt !== note.createdAt

  // 자동 저장 함수
  const autoSave = useCallback(async () => {
    if (!hasChanges || saveStatus === 'saving' || isSaving) return

    setSaveStatus('saving')
    setError(null)

    try {
      const result = await updateNoteAction(note.id, editTitle, editContent)
      
      if (result.success) {
        setSaveStatus('saved')
        setOriginalData({ title: editTitle, content: editContent })
        
        // 2초 후 상태 초기화
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setError(result.error || '저장 중 오류가 발생했습니다.')
        // 에러 상태에서는 3초 후 자동으로 에러 상태 해제
        setTimeout(() => {
          setError(null)
          setSaveStatus('idle')
        }, 3000)
      }
    } catch {
      setSaveStatus('error')
      setError('저장 중 오류가 발생했습니다.')
      // 에러 상태에서는 3초 후 자동으로 에러 상태 해제
      setTimeout(() => {
        setError(null)
        setSaveStatus('idle')
      }, 3000)
    }
  }, [note.id, editTitle, editContent, hasChanges, saveStatus, isSaving])

  // 디바운스된 자동 저장
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (hasChanges && isEditing) {
      debounceTimer.current = setTimeout(() => {
        autoSave()
      }, 3000)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [editTitle, editContent, hasChanges, isEditing, autoSave])

  // 브라우저 이벤트 처리
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 저장 중이거나 편집 모드가 아니면 팝업 표시하지 않음
      if (isSaving || !isEditing || !hasChanges) {
        return
      }
      
      e.preventDefault()
      e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 떠나시겠습니까?'
    }

    const handlePopState = () => {
      // 저장 중이거나 편집 모드가 아니면 팝업 표시하지 않음
      if (isSaving || !isEditing || !hasChanges) {
        return
      }
      
      const confirmed = window.confirm('저장되지 않은 변경사항이 있습니다. 정말 떠나시겠습니까?')
      if (!confirmed) {
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [hasChanges, isEditing, isSaving])

  // 편집 모드 시작
  const handleEdit = () => {
    setIsEditing(true)
    setEditTitle(note.title)
    setEditContent(note.content || '')
    setOriginalData({ title: note.title, content: note.content || '' })
    setError(null)
  }

  // 편집 취소
  const handleCancel = () => {
    setIsEditing(false)
    setEditTitle(originalData.title)
    setEditContent(originalData.content)
    setError(null)
    setSaveStatus('idle')
  }

  // 수동 저장
  const handleSave = async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    setIsSaving(true)
    setSaveStatus('saving')
    setError(null)

    try {
      const result = await updateNoteAction(note.id, editTitle, editContent)
      
      if (result.success) {
        setSaveStatus('saved')
        setOriginalData({ title: editTitle, content: editContent })
        
        // 편집 모드 종료하여 beforeunload 이벤트 비활성화
        setIsEditing(false)
        
        // 저장 성공 후 노트 목록 페이지로 리다이렉트
        window.location.href = '/dashboard'
      } else {
        setIsSaving(false)
        setSaveStatus('error')
        setError(result.error || '저장 중 오류가 발생했습니다.')
        // 에러 상태에서는 3초 후 자동으로 에러 상태 해제
        setTimeout(() => {
          setError(null)
          setSaveStatus('idle')
        }, 3000)
      }
    } catch {
      setIsSaving(false)
      setSaveStatus('error')
      setError('저장 중 오류가 발생했습니다.')
      // 에러 상태에서는 3초 후 자동으로 에러 상태 해제
      setTimeout(() => {
        setError(null)
        setSaveStatus('idle')
      }, 3000)
    }
  }

  // 요약 생성
  const handleGenerateSummary = async () => {
    if (!note.content || note.content.trim().length === 0) {
      setSummaryError('요약할 내용이 없습니다.')
      return
    }

    setSummaryStatus('loading')
    setSummaryError(null)

    try {
      const result = await generateSummaryAction(note.id, note.content, note.userId)
      
      if (result.success && result.summary) {
        setSummary(result.summary)
        setSummaryStatus('loaded')
      } else {
        setSummaryError(result.error || '요약 생성에 실패했습니다.')
        setSummaryStatus('error')
      }
    } catch {
      setSummaryError('요약 생성 중 오류가 발생했습니다.')
      setSummaryStatus('error')
    }
  }

  // 요약 조회
  const loadSummary = useCallback(async () => {
    setSummaryStatus('loading')
    setSummaryError(null)

    try {
      const result = await getSummaryAction(note.id, note.userId)
      
      if (result.success && result.summary) {
        setSummary(result.summary)
        setSummaryStatus('loaded')
      } else {
        setSummaryStatus('idle')
      }
    } catch {
      setSummaryError('요약 조회 중 오류가 발생했습니다.')
      setSummaryStatus('error')
    }
  }, [note.id, note.userId])

  // 태그 생성
  const handleGenerateTags = async () => {
    if (!note.content || note.content.trim().length === 0) {
      setTagError('태그를 생성할 내용이 없습니다.')
      return
    }

    setTagStatus('loading')
    setTagError(null)

    try {
      const result = await generateTagsAction(note.id, note.content, note.userId)
      
      if (result.success && result.tags) {
        setTags(result.tags)
        setTagStatus('loaded')
      } else {
        setTagError(result.error || '태그 생성에 실패했습니다.')
        setTagStatus('error')
      }
    } catch {
      setTagError('태그 생성 중 오류가 발생했습니다.')
      setTagStatus('error')
    }
  }

  // 태그 조회
  const loadTags = useCallback(async () => {
    setTagStatus('loading')
    setTagError(null)

    try {
      const result = await getTagsAction(note.id, note.userId)
      
      if (result.success && result.tags) {
        setTags(result.tags)
        setTagStatus('loaded')
      } else {
        setTagStatus('idle')
      }
    } catch {
      setTagError('태그 조회 중 오류가 발생했습니다.')
      setTagStatus('error')
    }
  }, [note.id, note.userId])

  // 태그 클릭 핸들러 (검색 페이지로 이동)
  const handleTagClick = (tag: string) => {
    // TODO: 태그 검색 페이지로 이동하는 로직 구현
    console.log('Tag clicked:', tag)
  }

  // 요약 편집 시작
  const handleEditSummary = () => {
    setEditSummary(summary?.content || '')
    setSummaryStatus('editing')
  }

  // 요약 편집 취소
  const handleCancelSummaryEdit = () => {
    setEditSummary('')
    setSummaryStatus('loaded')
  }

  // 요약 저장
  const handleSaveSummary = async () => {
    if (!editSummary.trim()) {
      setSummaryError('요약 내용을 입력해주세요.')
      return
    }

    setSummaryStatus('loading')
    setSummaryError(null)

    try {
      const result = await updateSummaryAction(note.id, editSummary, note.userId)
      
      if (result.success && result.summary) {
        setSummary(result.summary)
        setSummaryStatus('loaded')
        setEditSummary('')
      } else {
        setSummaryError(result.error || '요약 저장에 실패했습니다.')
        setSummaryStatus('error')
      }
    } catch {
      setSummaryError('요약 저장 중 오류가 발생했습니다.')
      setSummaryStatus('error')
    }
  }

  // 태그 편집 시작
  const handleEditTags = () => {
    setEditTags(tags.map(tag => tag.tag))
    setTagStatus('editing')
  }

  // 태그 편집 취소
  const handleCancelTagEdit = () => {
    setEditTags([])
    setNewTag('')
    setTagStatus('loaded')
  }

  // 태그 저장
  const handleSaveTags = async () => {
    setTagStatus('loading')
    setTagError(null)

    try {
      const result = await updateTagsAction(note.id, editTags, note.userId)
      
      if (result.success && result.tags) {
        setTags(result.tags)
        setTagStatus('loaded')
        setEditTags([])
        setNewTag('')
      } else {
        setTagError(result.error || '태그 저장에 실패했습니다.')
        setTagStatus('error')
      }
    } catch {
      setTagError('태그 저장 중 오류가 발생했습니다.')
      setTagStatus('error')
    }
  }

  // 새 태그 추가
  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()])
      setNewTag('')
    }
  }

  // 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove))
  }

  // 엔터키로 태그 추가
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // 컴포넌트 마운트 시 요약 및 태그 로드
  useEffect(() => {
    loadSummary()
    loadTags()
  }, [note.id, loadSummary, loadTags])

  // AI 처리 상태 주기적 확인 (요약이나 태그가 없을 때만)
  useEffect(() => {
    if (summaryStatus === 'idle' && tagStatus === 'idle' && note.content && note.content.trim().length > 0) {
      const interval = setInterval(() => {
        // 요약이 없으면 다시 시도
        if (!summary) {
          loadSummary()
        }
        // 태그가 없으면 다시 시도
        if (tags.length === 0) {
          loadTags()
        }
      }, 3000) // 3초마다 확인

      // 30초 후에는 주기적 확인 중단
      const timeout = setTimeout(() => {
        clearInterval(interval)
      }, 30000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [note.id, summaryStatus, tagStatus, summary, tags, loadSummary, loadTags, note.content])

  // 저장 상태 표시 컴포넌트
  const SaveStatusBadge = () => {
    if (saveStatus === 'saving') {
      return <Badge variant="warning">저장 중...</Badge>
    }
    if (saveStatus === 'saved') {
      return <Badge variant="success">저장됨</Badge>
    }
    if (saveStatus === 'error') {
      return <Badge variant="destructive">저장 실패</Badge>
    }
    return null
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1719858403455-9a2582eca805?q=80&w=798&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 콘텐츠 */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave}
                    disabled={saveStatus === 'saving' || !hasChanges}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>취소</span>
                  </Button>
                </>
              ) : (
                <>
                  <ExportButton 
                    noteId={note.id}
                    noteTitle={note.title}
                    className="flex items-center space-x-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleEdit}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>수정</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </Button>
                </>
              )}
              {isEditing && <SaveStatusBadge />}
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2 duration-300">
            <AlertDescription className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">저장 실패:</span>
              <span>{error}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* 노트 내용 */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader>
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold border-none shadow-none p-0 focus-visible:ring-0"
                placeholder="제목을 입력하세요"
              />
            ) : (
              <CardTitle className="text-2xl">{note.title}</CardTitle>
            )}
            <div className="text-sm text-gray-600">
              {isUpdated ? (
                <>
                  수정됨 • {formatDate(note.updatedAt!)}
                </>
              ) : (
                formatDate(note.createdAt!)
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[400px] border-none shadow-none p-0 focus-visible:ring-0 resize-none"
                  placeholder="내용을 입력하세요"
                />
              ) : note.content ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {note.content}
                </div>
              ) : (
                <p className="text-gray-500 italic">내용이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI 요약 섹션 */}
        <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI 요약</CardTitle>
              <div className="flex items-center space-x-2">
                {summaryStatus === 'idle' && note.content && note.content.trim().length > 0 && (
                  <Button 
                    onClick={handleGenerateSummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>요약 생성</span>
                  </Button>
                )}
                {summaryStatus === 'loaded' && summary && (
                  <Button 
                    onClick={handleEditSummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>편집</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {summaryStatus === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-600">요약을 처리하고 있습니다...</span>
              </div>
            )}
            
            {summaryStatus === 'loaded' && summary && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  {summary.model} • {formatDate(summary.createdAt)}
                </div>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {summary.content}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={handleGenerateSummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>다시 생성</span>
                  </Button>
                </div>
              </div>
            )}

            {summaryStatus === 'editing' && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  요약 편집 중
                </div>
                <Textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="min-h-[200px] resize-none"
                  placeholder="요약 내용을 입력하세요"
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={handleCancelSummaryEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>취소</span>
                  </Button>
                  <Button 
                    onClick={handleSaveSummary}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </Button>
                </div>
              </div>
            )}
            
            {summaryStatus === 'error' && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertDescription>
                    {summaryError || '요약 처리 중 오류가 발생했습니다.'}
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerateSummary}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>다시 시도</span>
                  </Button>
                </div>
              </div>
            )}
            
            {summaryStatus === 'idle' && !summary && (
              <div className="text-center py-8 text-gray-500">
                {note.content && note.content.trim().length > 0 ? (
                  <p>AI 요약을 생성해보세요.</p>
                ) : (
                  <p>노트 내용이 있어야 요약을 생성할 수 있습니다.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI 태그 섹션 */}
        <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI 태그</CardTitle>
              <div className="flex items-center space-x-2">
                {tagStatus === 'idle' && note.content && note.content.trim().length > 0 && (
                  <Button 
                    onClick={handleGenerateTags}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>태그 생성</span>
                  </Button>
                )}
                {tagStatus === 'loaded' && tags.length > 0 && (
                  <Button 
                    onClick={handleEditTags}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>편집</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tagStatus === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-600">태그를 처리하고 있습니다...</span>
              </div>
            )}
            
            {tagStatus === 'loaded' && tags.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  {tags.length}개의 태그 • {formatDate(tags[0]?.createdAt || new Date())}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      onClick={() => handleTagClick(tag.tag)}
                    >
                      {tag.tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={handleGenerateTags}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>다시 생성</span>
                  </Button>
                </div>
              </div>
            )}

            {tagStatus === 'editing' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-3">
                  태그 편집 중
                </div>
                
                {/* 기존 태그들 */}
                <div className="flex flex-wrap gap-2">
                  {editTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1 pr-2"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* 새 태그 추가 */}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="새 태그 입력 후 Enter"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    disabled={!newTag.trim() || editTags.includes(newTag.trim())}
                  >
                    추가
                  </Button>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={handleCancelTagEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>취소</span>
                  </Button>
                  <Button 
                    onClick={handleSaveTags}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </Button>
                </div>
              </div>
            )}
            
            {tagStatus === 'error' && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertDescription>
                    {tagError || '태그 처리 중 오류가 발생했습니다.'}
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerateTags}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>다시 시도</span>
                  </Button>
                </div>
              </div>
            )}
            
            {tagStatus === 'idle' && tags.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {note.content && note.content.trim().length > 0 ? (
                  <p>AI 태그를 생성해보세요.</p>
                ) : (
                  <p>노트 내용이 있어야 태그를 생성할 수 있습니다.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        noteId={note.id}
        noteTitle={note.title}
      />
    </div>
  )
}
