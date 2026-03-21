import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight, Menu, Calendar, Tag } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
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
        {label}
      </a>
    </div>
  );
}

function splitContentAtMidpoint(content: string): [string, string] {
  const lines = content.split('\n');
  const mid = Math.floor(lines.length / 2);
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
  const { openDrawer } = useDrawer();
  const navigate = useNavigate();
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

      {/* Mobile Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => navigate('/blog')}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#4a7c3f',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          <ChevronLeft size={20} />
          <span className="md:hidden">ブログ</span>
        </button>

        <h1 className="md:hidden" style={{ fontSize: '22px', fontWeight: 900, fontStyle: 'italic', color: '#1a1a2e' }}>
          PickleHub
        </h1>

        <button
          onClick={openDrawer}
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={24} style={{ color: '#1a1a2e' }} />
        </button>
        <div className="hidden md:block" style={{ width: '32px' }} />
      </header>

      {/* Article */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Article header card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px 20px 20px',
          marginTop: '16px',
          marginBottom: '4px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#4a7c3f',
              background: '#f0f7ee',
              borderRadius: '6px',
              padding: '3px 10px',
            }}>
              <Tag size={11} />
              {post.category}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#999',
            }}>
              <Calendar size={11} />
              {post.date}
            </span>
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#1a1a2e',
            lineHeight: 1.5,
            letterSpacing: '-0.3px',
          }}>
            {post.title}
          </h1>

          <p style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.7,
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #F0F0F0',
          }}>
            {post.description}
          </p>
        </div>

        {/* Article body */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '0 0 12px 12px',
          padding: '24px 20px',
          marginBottom: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div className="blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {firstHalf}
            </ReactMarkdown>
          </div>

          <AffiliateCTA
            url={post.affiliateLinks.main}
            label="▶ Amazonで人気パドルをチェック"
          />

          <div className="blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {secondHalf}
            </ReactMarkdown>
          </div>

          <AffiliateCTA
            url={post.affiliateLinks.sub}
            label="▶ Amazonでピックルボール用品を見る"
          />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '10px', paddingLeft: '4px' }}>
              関連記事
            </h2>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {relatedPosts.map((related, i) => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: i < relatedPosts.length - 1 ? '1px solid #F0F0F0' : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#4a7c3f',
                        display: 'block',
                        marginBottom: '3px',
                      }}>
                        {related.category}
                      </span>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                        {related.title}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: '#ccc', flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to list */}
        <Link
          to="/blog"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '12px',
            background: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#4a7c3f',
            textDecoration: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <ChevronLeft size={18} />
          ブログ一覧に戻る
        </Link>
      </div>
    </div>
  );
}
