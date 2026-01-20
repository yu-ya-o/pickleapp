// Fetch sitemap from backend API after build
const SITEMAP_URL = 'https://pickleapp.onrender.com/sitemap.xml';
const OUTPUT_PATH = './dist/sitemap.xml';

async function fetchSitemap() {
  try {
    console.log('Fetching sitemap from backend...');
    const response = await fetch(SITEMAP_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }

    const sitemap = await response.text();

    const fs = await import('fs');
    fs.writeFileSync(OUTPUT_PATH, sitemap);

    console.log('Sitemap saved to dist/sitemap.xml');
  } catch (error) {
    console.error('Error fetching sitemap:', error.message);
    console.log('Creating fallback static sitemap...');

    // Fallback to basic static sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://picklehub.jp/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://picklehub.jp/events</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://picklehub.jp/teams</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://picklehub.jp/rankings</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    const fs = await import('fs');
    fs.writeFileSync(OUTPUT_PATH, fallbackSitemap);
    console.log('Fallback sitemap saved to dist/sitemap.xml');
  }
}

fetchSitemap();
