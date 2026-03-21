import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  affiliateLinks: {
    main: string;
    sub: string;
  };
  content: string;
}

export const BLOG_CATEGORIES = [
  'パドル',
  'シューズ',
  '初心者ガイド',
  '大会情報',
  'ルール解説',
] as const;

// Eagerly import all markdown files as raw strings at build time
const rawFiles = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parsePost(filePath: string, raw: string): BlogPost {
  const slug = filePath.split('/').pop()?.replace('.md', '') ?? filePath;
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    date: String(data.date ?? ''),
    category: String(data.category ?? ''),
    affiliateLinks: {
      main: String((data.affiliateLinks as Record<string, string>)?.main ?? ''),
      sub: String((data.affiliateLinks as Record<string, string>)?.sub ?? ''),
    },
    content,
  };
}

let _allPosts: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_allPosts) return _allPosts;

  _allPosts = Object.entries(rawFiles)
    .map(([path, raw]) => parsePost(path, raw))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return _allPosts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}
