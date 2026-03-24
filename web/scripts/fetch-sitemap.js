// Fetch sitemap from backend API after build, then merge blog post URLs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, '..', p);

const SITEMAP_URL = 'https://pickleapp.onrender.com/sitemap.xml';
const OUTPUT_PATH = resolve('dist/sitemap.xml');
const BASE_URL = 'https://picklehub.jp';

// Read blog posts from content/blog/ and extract date from frontmatter
function getBlogEntries() {
  const blogDir = resolve('content/blog');
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace('.md', '');
      const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
      const dateMatch = raw.match(/^date:\s*"?([^"\n]+)"?/m);
      const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];
      return { slug, date };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function buildBlogSitemapXml(entries) {
  return entries
    .map(
      ({ slug, date }) => `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n');
}

async function fetchSitemap() {
  const blogEntries = getBlogEntries();
  console.log(`Found ${blogEntries.length} blog posts to add to sitemap`);

  let baseSitemap = null;

  try {
    console.log('Fetching sitemap from backend...');
    const response = await fetch(SITEMAP_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }

    baseSitemap = await response.text();
    console.log('Fetched base sitemap from backend');
  } catch (error) {
    console.error('Error fetching sitemap:', error.message);
    console.log('Using fallback static sitemap...');

    baseSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/events</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/teams</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/rankings</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  }

  // Inject blog URLs into sitemap (before closing </urlset> tag)
  const blogXml = buildBlogSitemapXml(blogEntries);
  const finalSitemap = baseSitemap.replace(
    '</urlset>',
    `${blogXml}\n</urlset>`
  );

  fs.writeFileSync(OUTPUT_PATH, finalSitemap);
  console.log(`Sitemap saved to dist/sitemap.xml (${blogEntries.length} blog posts added)`);
}

fetchSitemap();
