-- drizzle/rls-policies.sql
-- Supabase RLS (Row Level Security) 정책 설정
-- 노트 테이블과 사용자 프로필 테이블에 대한 사용자별 접근 제어 정책
-- 관련 파일: lib/db/schema/notes.ts, lib/db/schema/user-profiles.ts, lib/notes/actions.ts, lib/user-profiles/actions.ts

-- 노트 테이블 RLS 활성화
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 노트만 조회할 수 있는 정책
CREATE POLICY "Users can view own notes" ON public.notes
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자가 자신의 노트만 생성할 수 있는 정책
CREATE POLICY "Users can create own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 노트만 수정할 수 있는 정책
CREATE POLICY "Users can update own notes" ON public.notes
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자가 자신의 노트만 삭제할 수 있는 정책
CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- 사용자 프로필 테이블 RLS 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 프로필만 조회할 수 있는 정책
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 사용자가 자신의 프로필만 생성할 수 있는 정책
CREATE POLICY "Users can create own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 사용자가 자신의 프로필만 수정할 수 있는 정책
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
