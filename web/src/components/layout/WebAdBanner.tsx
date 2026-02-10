// 一時的にコメントアウト
// import { useEffect, useRef, useState } from 'react';
//
// declare global {
//   interface Window {
//     adsbygoogle: unknown[];
//   }
// }
//
// /**
//  * Web版下部固定バナー広告コンポーネント（Google AdSense）
//  */
// export function WebAdBanner() {
//   const adRef = useRef<HTMLModElement>(null);
//   const [adLoaded, setAdLoaded] = useState(false);
//
//   useEffect(() => {
//     try {
//       (window.adsbygoogle = window.adsbygoogle || []).push({});
//     } catch {
//       // AdSense script not loaded
//     }
//
//     // 広告が読み込まれたかチェック
//     const checkAd = setTimeout(() => {
//       if (adRef.current && adRef.current.offsetHeight > 0) {
//         setAdLoaded(true);
//       }
//     }, 1000);
//
//     return () => clearTimeout(checkAd);
//   }, []);
//
//   return (
//     <div
//       className="fixed bottom-0 left-0 right-0 z-50 md:left-64 lg:left-72"
//       style={{
//         minHeight: adLoaded ? 'auto' : '0',
//         overflow: 'hidden'
//       }}
//     >
//       <ins
//         ref={adRef}
//         className="adsbygoogle"
//         style={{ display: 'block', height: '60px' }}
//         data-ad-client="ca-pub-2543138582776514"
//         data-ad-slot="7732342593"
//         data-ad-format="horizontal"
//         data-full-width-responsive="false"
//       />
//     </div>
//   );
// }

export function WebAdBanner() {
  return null;
}
