// vitest.config.ts
// Vitest 테스트 설정
// AI 서비스 테스트를 위한 설정을 정의합니다

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'lib': path.resolve(__dirname, './lib')
    }
  }
});
