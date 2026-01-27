/**
 * Web版下部固定バナー広告コンポーネント
 *
 * TODO: Google AdSenseや他の広告ネットワークに置き換え可能
 */
export function WebAdBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64 lg:left-72">
      <div className="bg-gradient-to-r from-[var(--primary)] to-[#00BA7C] text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-sm font-medium">
              PickleHub - ピックルボールのイベント＆サークル管理
            </p>
            <p className="text-xs opacity-90">
              無料で始められます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
