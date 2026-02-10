import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const agents = [
  {
    name: '김서연',
    title: '종양내과 전문의',
    color: '#E74C3C',
    icon: 'O',
    focus: '임상시험 데이터 품질, 통계적 유의성, 환자 안전성',
  },
  {
    name: '박준호',
    title: '약물경제학 전문가',
    color: '#2ECC71',
    icon: 'P',
    focus: '약물경제성 평가, 약가 결정, 환자 접근성',
  },
  {
    name: '이현우',
    title: '바이오텍 투자 분석가',
    color: '#3498DB',
    icon: 'A',
    focus: '시장 규모 분석, rNPV 모델링, 파이프라인 가치 평가',
  },
  {
    name: '정미래',
    title: '규제과학 전문가',
    color: '#F39C12',
    icon: 'R',
    focus: 'FDA/EMA/MFDS 승인 경로, CMC 준비도, 규제 리스크',
  },
  {
    name: '최은지',
    title: '면역학/약리학 전문가',
    color: '#9B59B6',
    icon: 'I',
    focus: '작용기전 타당성, 타겟 밸리데이션, 기술 플랫폼 확장성',
  },
];

const features = [
  {
    title: '5명 AI 전문가 패널',
    description: '종양내과, 약물경제학, 투자분석, 규제과학, 면역학 전문가가 다각도로 기업을 평가합니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: '실시간 토론 스트리밍',
    description: 'AI 전문가들의 분석과 반론, 최종 판결까지 실시간으로 확인할 수 있습니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    title: '구조화된 투자 리포트',
    description: '종합 점수, 차원별 평가, 파이프라인 분석, 리스크 히트맵 등 체계적인 리포트를 생성합니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: '실제 전문가 연결',
    description: 'AI 분석 결과를 바탕으로 해당 분야 실제 전문가에게 자문을 요청할 수 있습니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: '01',
    title: '기업 정보 입력',
    description: '분석할 바이오/헬스케어 기업명과 섹터를 입력합니다. 티커, 추가 설명도 입력할 수 있습니다.',
  },
  {
    number: '02',
    title: 'AI 패널 토론',
    description: '5명의 AI 전문가가 독립 분석, 상호 검토, 반론, 최종 판결의 4단계 토론을 진행합니다.',
  },
  {
    number: '03',
    title: '투자 심사 리포트',
    description: '토론 결과를 종합하여 점수, 파이프라인, 리스크, 경쟁사 분석 등 구조화된 리포트를 생성합니다.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
              5명의 AI 전문가가 실시간 토론 중
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              AI 전문가 패널이 분석하는{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                바이오/헬스케어 기업 심사
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              종양내과 전문의, 약물경제학자, 투자 분석가, 규제 전문가, 면역학자 --
              5명의 AI 전문가 패널이 실시간 토론을 통해 바이오/헬스케어 기업 투자 심사 리포트를 생성합니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/analysis/new"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                무료로 분석 시작하기
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
              >
                작동 방식 알아보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI가 만드는 전문가 수준의 투자 심사
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              단순한 요약이 아닌, 다양한 전문 분야의 시각으로 심층 분석하고 토론합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              3단계로 완성되는 AI 심사
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              기업 정보를 입력하면, AI 패널이 자동으로 토론하여 리포트를 생성합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow h-full">
                  <div className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Profiles Preview */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI 전문가 패널 소개
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              각 분야 최고 수준의 전문성을 갖춘 AI 에이전트가 독립적으로 분석하고 서로 토론합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {agents.map((agent, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: agent.color }}
                />
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-0.5">{agent.name}</h3>
                  <p className="text-xs font-medium mb-3" style={{ color: agent.color }}>
                    {agent.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{agent.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            지금 바로 AI 패널 심사를 시작하세요
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            5명의 AI 전문가가 귀사가 관심있는 바이오/헬스케어 기업을
            다각도로 분석하고, 구조화된 투자 심사 리포트를 제공합니다.
          </p>
          <Link
            href="/analysis/new"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            분석 시작하기
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
