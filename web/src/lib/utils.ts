import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return formatDate(dateString);
}

export function getSkillLevelEmoji(skillLevel: string): string {
  switch (skillLevel) {
    case 'beginner':
      return '🟢';
    case 'intermediate':
      return '🟡';
    case 'advanced':
      return '🔴';
    default:
      return '';
  }
}

export function getSkillLevelLabel(skillLevel: string): string {
  switch (skillLevel) {
    case 'all':
      return '全レベル';
    case 'beginner':
      return '初心者';
    case 'intermediate':
      return '中級者';
    case 'advanced':
      return '上級者';
    default:
      return skillLevel;
  }
}

export function getDisplayName(user: { name: string; nickname?: string | null }): string {
  return user.nickname || user.name;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Detect if the current browser is an in-app browser (WebView).
 * Google blocks OAuth from these browsers with error 403: disallowed_useragent.
 */
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || '';
  // LINE, Instagram, Facebook, Twitter/X, TikTok, WeChat, etc.
  return /Line\/|FBAN|FBAV|Instagram|Twitter|TikTok|BytedanceWebview|MicroMessenger|KAKAOTALK/i.test(ua);
}

/**
 * Get the name of the detected in-app browser, or null if not in one.
 */
export function getInAppBrowserName(): string | null {
  const ua = navigator.userAgent || '';
  if (/Line\//i.test(ua)) return 'LINE';
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/Twitter/i.test(ua)) return 'X (Twitter)';
  if (/TikTok|BytedanceWebview/i.test(ua)) return 'TikTok';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  if (/KAKAOTALK/i.test(ua)) return 'KakaoTalk';
  return null;
}
