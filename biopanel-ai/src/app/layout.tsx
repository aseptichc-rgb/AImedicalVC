import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioPanel AI - 의료·바이오 AI 심사역 토론 플랫폼',
  description: '5명의 AI 전문가 패널이 바이오/헬스케어 기업을 실시간 분석하고 토론하여 투자 심사 리포트를 생성합니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
