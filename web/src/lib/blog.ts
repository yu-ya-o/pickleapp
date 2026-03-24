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
  'コート・施設',
  'コミュニティ・楽しみ方',
] as const;

// Eagerly import all markdown files as raw strings at build time
const rawFiles = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const content = match[2];
  const data: Record<string, unknown> = {};
  let current = match[1];

  // Parse affiliateLinks block
  const affiliateMatch = current.match(/affiliateLinks:\s*\n((?:\s+\S[^\n]*\n?)*)/);
  if (affiliateMatch) {
    const links: Record<string, string> = {};
    for (const line of affiliateMatch[1].split('\n')) {
      const m = line.match(/^\s+(\w+):\s*"?([^"]*)"?\s*$/);
      if (m) links[m[1]] = m[2];
    }
    data.affiliateLinks = links;
    current = current.replace(affiliateMatch[0], '');
  }

  for (const line of current.split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (m) data[m[1]] = m[2];
  }

  return { data, content };
}

function parsePost(filePath: string, raw: string): BlogPost {
  const slug = filePath.split('/').pop()?.replace('.md', '') ?? filePath;
  const { data, content } = parseFrontmatter(raw);

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
