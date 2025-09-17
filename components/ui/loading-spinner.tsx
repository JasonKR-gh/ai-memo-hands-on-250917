// components/ui/loading-spinner.tsx
// 로딩 스피너 UI 컴포넌트
// 데이터 로딩 중 표시할 스피너 컴포넌트
// 관련 파일: components/ui/button.tsx, app/dashboard/page.tsx

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingSpinnerWithTextProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinnerWithText({ 
  text = '로딩 중...', 
  size = 'md',
  className 
}: LoadingSpinnerWithTextProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <LoadingSpinner size={size} />
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  )
}
