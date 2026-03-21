import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';

function AffiliateCTA({ url, label }: { url: string; label: string }) {
  if (!url || url === 'https://www.amazon.co.jp/') return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff8e7 0%, #fef3d0 100%)',
      border: '2px solid #f5a623',
      borderRadius: '12px',
      padding: '16px 20px',
      margin: '28px 0',
      textAlign: 'center',
    }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f5a623',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '14px',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
        }}
      >
        <ExternalLink size={16} />
        {label}
      </a>
    </div>
  );
}

// Splits markdown content roughly in half to insert mid-article CTA
function splitContentAtMidpoint(content: string): [string, string] {
  const lines = content.split('\n');
  const mid = Math.floor(lines.length / 2);
  // Find nearest heading after midpoint
  let splitIndex = mid;
  for (let i = mid; i < lines.length; i++) {
    if (lines[i].startsWith('## ') || lines[i].startsWith('### ')) {
      splitIndex = i;
      break;
    }
  }
  return [lines.slice(0, splitIndex).join('\n'), lines.slice(splitIndex).join('\n')];
}

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category);
  const [firstHalf, secondHalf] = splitContentAtMidpoint(post.content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'PickleHub' },
    publisher: {
      '@type': 'Organization',
      name: 'PickleHub',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.png` },
    },
    url: `${SITE_URL}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'ブログ', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <SEO
        title={post.title}
        description={post.description}
        url={`/blog/${post.slug}`}
        type="article"
        jsonLd={[articleJsonLd, breadcrumbJsonLd]}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px 48px' }}>
        {/* Breadcrumb */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '16px 0 12px',
          fontSize: '12px',
          color: '#888',
        }}>
          <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>ホーム</Link>
          <ChevronRight size={12} />
          <Link to="/blog" style={{ color: '#888', textDecoration: 'none' }}>ブログ</Link>
          <ChevronRight size={12} />
          <span style={{ color: '#4a7c3f', fontWeight: 600 }}>{post.category}</span>
        </nav>

        {/* Article header */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4a7c3f 0%, #6abf5e 100%)',
            padding: '24px 20px',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '3px 10px',
            }}>
              {post.category}
            </span>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.5,
              marginTop: '12px',
            }}>
              {post.title}
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
              {post.date}
            </p>
          </div>

          {/* Article body */}
          <div style={{ padding: '20px' }}>
            <div className="blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {firstHalf}
              </ReactMarkdown>
            </div>

            {/* Mid-article affiliate CTA */}
            <AffiliateCTA
              url={post.affiliateLinks.main}
              label="▶ Amazonで人気パドルをチェック"
            />

            <div className="blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {secondHalf}
              </ReactMarkdown>
            </div>

            {/* End affiliate CTA */}
            <AffiliateCTA
              url={post.affiliateLinks.sub}
              label="▶ Amazonでピックルボール用品を見る"
            />
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
              関連記事
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#4a7c3f',
                        background: '#e8f2e6',
                        borderRadius: '20px',
                        padding: '2px 8px',
                        marginBottom: '6px',
                        display: 'inline-block',
                      }}>
                        {related.category}
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                        {related.title}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: '#888', flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to list */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: '#1a1a2e',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← ブログ一覧へ
          </Link>
        </div>
      </div>
    </div>
  );
}
