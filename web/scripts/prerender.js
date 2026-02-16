// Build-time prerendering script
// Generates static HTML files with SEO meta tags for key routes

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, '..', p);

const API_URL = process.env.VITE_API_URL || 'https://pickleapp.onrender.com';

// Mock browser globals for SSR (api.ts uses localStorage in constructor)
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

// Routes to pre-render (public, SEO-important pages)
const ROUTES = ['/', '/events', '/teams', '/rankings', '/tournaments'];

// Fetch stats data from the backend API for SSR embedding
async function fetchPrerenderData() {
  try {
    console.log(`Fetching prerender data from ${API_URL}...`);
    const response = await fetch(`${API_URL}/api/stats`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Stats API returned ${response.status}`);
    }

    const stats = await response.json();
    console.log(`Fetched stats: ${stats.eventCount} events, ${stats.teamCount} teams`);
    return { stats };
  } catch (error) {
    console.warn('Failed to fetch prerender data:', error.message);
    return null;
  }
}

async function prerender() {
  console.log('Starting pre-rendering...');

  // Fetch data from API for embedding
  const prerenderData = await fetchPrerenderData();

  // Read the built index.html as template
  const templatePath = resolve('dist/index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Save original as SPA fallback (for routes without pre-rendered HTML)
  const spaFallback = template.replace('<!--ssr-outlet-->', '');
  fs.writeFileSync(resolve('dist/_spa.html'), spaFallback);
  console.log('Saved SPA fallback: dist/_spa.html');

  // Import SSR module
  const { render } = await import(resolve('dist/server/entry-server.js'));

  for (const url of ROUTES) {
    try {
      const { html: appHtml, helmet } = render(url);

      let finalHtml = template;

      // Inject rendered HTML into the root div
      finalHtml = finalHtml.replace('<!--ssr-outlet-->', appHtml);

      // Replace SEO tags section with helmet-generated tags
      if (helmet) {
        const helmetTags = [
          helmet.title.toString(),
          helmet.meta.toString(),
          helmet.link.toString(),
          helmet.script.toString(),
        ]
          .filter(Boolean)
          .join('\n    ');

        // Replace the content between SSR markers with helmet output
        finalHtml = finalHtml.replace(
          /<!--seo-tags-start-->[\s\S]*?<!--seo-tags-end-->/,
          `<!--seo-tags-start-->\n    ${helmetTags}\n    <!--seo-tags-end-->`
        );
      }

      // Inject prerender data as a script tag (before the main script)
      if (prerenderData) {
        const dataScript = `<script>window.__PRERENDER_DATA__=${JSON.stringify(prerenderData)};</script>`;
        finalHtml = finalHtml.replace(
          '<script type="module"',
          `${dataScript}\n    <script type="module"`
        );
      }

      // Determine output path
      if (url === '/') {
        fs.writeFileSync(resolve('dist/index.html'), finalHtml);
      } else {
        const dir = resolve(`dist${url}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), finalHtml);
      }

      console.log(`Pre-rendered: ${url}`);
    } catch (err) {
      console.error(`Failed to prerender ${url}:`, err.message);
      // Continue with other routes even if one fails
    }
  }

  // Clean up server build (not needed in production)
  fs.rmSync(resolve('dist/server'), { recursive: true, force: true });
  console.log('Cleaned up server build artifacts.');

  console.log('Pre-rendering complete!');
}

prerender().catch((err) => {
  console.error('Pre-rendering failed:', err);
  // Don't exit with error - the site should still work as SPA
  console.log('Site will fall back to client-side rendering.');
});
