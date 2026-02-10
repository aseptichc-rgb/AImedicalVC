export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">BP</span>
            </div>
            <span className="text-sm text-gray-500">Powered by BioPanel AI</span>
          </div>
          <p className="text-sm text-gray-400">AI 분석은 투자 조언이 아닙니다. 투자 결정 시 전문가와 상담하세요.</p>
        </div>
      </div>
    </footer>
  );
}
