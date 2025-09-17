// app/test-ai/page.tsx
// AI 서비스 테스트 페이지
// Gemini API 연동이 제대로 작동하는지 테스트할 수 있는 페이지입니다
// 관련 파일: lib/ai/actions.ts, lib/ai/gemini-client.ts

'use client';

import { useState } from 'react';
import { generateTextAction, healthCheckAction, getUsageStatsAction } from '@/lib/ai/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function TestAIPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [usageStats, setUsageStats] = useState<{
    totalRequests: number;
    errorRate: number;
    averageLatency: number;
  } | null>(null);

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await generateTextAction(prompt);
      if (response.success) {
        setResult(response.text || '');
      } else {
        setResult(`에러: ${response.error}`);
      }
    } catch {
      setResult('에러: 텍스트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    setIsLoading(true);
    try {
      const response = await healthCheckAction();
      if (response.success) {
        setHealthStatus(response.isHealthy || false);
      } else {
        setHealthStatus(false);
      }
    } catch {
      setHealthStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStats = async () => {
    setIsLoading(true);
    try {
      const response = await getUsageStatsAction();
      if (response.success && response.stats) {
        setUsageStats(response.stats);
      }
    } catch {
      // 에러 무시
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AI 서비스 테스트</h1>
      
      <div className="grid gap-6">
        {/* 헬스체크 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>API 헬스체크</CardTitle>
            <CardDescription>Gemini API 연결 상태를 확인합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleHealthCheck} disabled={isLoading}>
                {isLoading ? '확인 중...' : '헬스체크 실행'}
              </Button>
              {healthStatus !== null && (
                <Badge variant={healthStatus ? 'default' : 'destructive'}>
                  {healthStatus ? '정상' : '오류'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 텍스트 생성 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>텍스트 생성 테스트</CardTitle>
            <CardDescription>Gemini API를 사용하여 텍스트를 생성합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                프롬프트
              </label>
              <Textarea
                id="prompt"
                placeholder="AI에게 요청할 내용을 입력하세요..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleGenerateText} disabled={isLoading || !prompt.trim()}>
              {isLoading ? '생성 중...' : '텍스트 생성'}
            </Button>
            {result && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">결과</label>
                <div className="p-4 bg-gray-50 rounded-md border">
                  <pre className="whitespace-pre-wrap">{result}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 사용량 통계 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>사용량 통계</CardTitle>
            <CardDescription>API 사용량 정보를 확인합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGetStats} disabled={isLoading}>
              {isLoading ? '조회 중...' : '통계 조회'}
            </Button>
            {usageStats && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{usageStats.totalRequests}</div>
                  <div className="text-sm text-gray-600">총 요청 수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{usageStats.errorRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">에러율</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{usageStats.averageLatency.toFixed(0)}ms</div>
                  <div className="text-sm text-gray-600">평균 응답시간</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
