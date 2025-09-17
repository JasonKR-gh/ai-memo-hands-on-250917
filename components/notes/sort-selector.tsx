// components/notes/sort-selector.tsx
// 노트 정렬 옵션 선택 컴포넌트
// 사용자가 노트 목록을 정렬할 수 있는 드롭다운 선택기
// 관련 파일: components/notes/note-list.tsx, lib/notes/queries.ts

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, ArrowUp, ArrowDown, Type } from 'lucide-react'
import { SortOption } from '@/lib/notes/queries'

interface SortSelectorProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
  className?: string
}

const sortOptions = [
  {
    value: 'newest' as SortOption,
    label: '최신순',
    icon: ArrowDown,
    description: '최근 수정된 순서'
  },
  {
    value: 'oldest' as SortOption,
    label: '오래된순',
    icon: ArrowUp,
    description: '오래전에 수정된 순서'
  },
  {
    value: 'title_asc' as SortOption,
    label: '제목 가나다순',
    icon: Type,
    description: '제목 오름차순'
  },
  {
    value: 'title_desc' as SortOption,
    label: '제목 가나다역순',
    icon: Type,
    description: '제목 내림차순'
  }
]

export function SortSelector({ currentSort, onSortChange, className }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0]

  const handleSortChange = (sort: SortOption) => {
    onSortChange(sort)
    setIsOpen(false)
  }

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
            <currentOption.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentOption.label}</span>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white/10 backdrop-blur-sm border-white/20">
          {sortOptions.map((option) => {
            const Icon = option.icon
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="flex items-center gap-3 cursor-pointer text-white hover:bg-white/20"
              >
                <Icon className="h-4 w-4 text-gray-300" />
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-gray-300">{option.description}</span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
