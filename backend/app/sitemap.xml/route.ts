import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SITE_URL = 'https://picklehub.jp';

export async function GET() {
  try {
    // Fetch all active events
    const events = await prisma.event.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Fetch all public teams
    const teams = await prisma.team.findMany({
      where: {
        visibility: 'public',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Fetch all users with public profiles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 1000, // Limit to prevent huge sitemaps
    });

    // Fetch public team events
    const teamEvents = await prisma.teamEvent.findMany({
      where: {
        visibility: 'public',
        status: 'active',
      },
      select: {
        id: true,
        teamId: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const today = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/events</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/teams</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/rankings</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;

    // Add dynamic event pages
    for (const event of events) {
      const lastmod = event.updatedAt.toISOString().split('T')[0];
      xml += `  <url>
    <loc>${SITE_URL}/events/${event.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Add dynamic team pages
    for (const team of teams) {
      const lastmod = team.updatedAt.toISOString().split('T')[0];
      xml += `  <url>
    <loc>${SITE_URL}/teams/${team.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add dynamic team event pages
    for (const teamEvent of teamEvents) {
      const lastmod = teamEvent.updatedAt.toISOString().split('T')[0];
      xml += `  <url>
    <loc>${SITE_URL}/teams/${teamEvent.teamId}/events/${teamEvent.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add dynamic user profile pages
    for (const user of users) {
      const lastmod = user.updatedAt.toISOString().split('T')[0];
      xml += `  <url>
    <loc>${SITE_URL}/p/${user.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return a basic sitemap on error
    const basicXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/events</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/teams</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/rankings</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return new NextResponse(basicXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
