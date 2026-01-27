import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Web版下部固定バナー広告コンポーネント（Google AdSense）
 *
 * 設定手順:
 * 1. index.html の ca-pub-XXXXXXXXXXXXXXXX を実際のパブリッシャーIDに置換
 * 2. 下記の data-ad-slot を実際の広告ユニットIDに置換
 */
export function WebAdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64 lg:left-72 bg-white">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2543138582776514"
        data-ad-slot="7732342593"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
