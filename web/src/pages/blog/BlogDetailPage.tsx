import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';

import { SEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';

function AffiliateCTA({ url, label }: { url: string; label: string }) {
  if (!url || url === 'https://www.amazon.co.jp/') return null;
  return (
    <div style={{
      background: '#fffbf0',
      border: '2px solid #f5a623',
      borderRadius: '8px',
      padding: '20px 24px',
      margin: '36px 0',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '14px' }}>
        ピックルボール用品をお探しなら
      </p>
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
          fontSize: '17px',
          padding: '14px 28px',
          borderRadius: '6px',
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
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
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
        borderBottom: '2px solid #4a7c3f',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
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
          }}
        >
          <Menu size={28} style={{ color: '#1a1a2e' }} />
        </button>
        <div className="hidden md:block" style={{ width: '40px' }} />

        <h1 className="md:hidden" style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', color: '#1a1a2e' }}>
          PickleHub
        </h1>

        <div style={{ width: '40px' }} />
      </header>

      {/* Article */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '16px 0 20px', fontSize: '15px', color: '#999', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#4a7c3f', textDecoration: 'none' }}>ホーム</Link>
          <span>›</span>
          <Link to="/blog" style={{ color: '#4a7c3f', textDecoration: 'none' }}>ブログ</Link>
          <span>›</span>
          <span style={{ color: '#999' }}>{post.category}</span>
        </nav>

        {/* Article header */}
        <div style={{ borderBottom: '2px solid #E8E8E8', paddingBottom: '24px', marginBottom: '32px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '15px',
            fontWeight: 700,
            color: '#FFFFFF',
            background: '#4a7c3f',
            borderRadius: '4px',
            padding: '4px 14px',
            marginBottom: '16px',
          }}>
            {post.category}
          </span>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#1a1a2e',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}>
            {post.title}
          </h1>

          <p style={{ fontSize: '16px', color: '#888' }}>
            公開日：{post.date}　｜　PickleHub編集部
          </p>
        </div>

        {/* Lead text */}
        <p style={{
          fontSize: '18px',
          color: '#444',
          lineHeight: 2.0,
          background: '#f8fdf7',
          border: '1px solid #d0e8cc',
          borderRadius: '6px',
          padding: '20px 24px',
          marginBottom: '36px',
        }}>
          {post.description}
        </p>

        {/* Article body */}
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

        {/* Back to list */}
        <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: '32px', marginTop: '16px' }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '17px',
              fontWeight: 600,
              color: '#4a7c3f',
              textDecoration: 'none',
            }}
          >
            <ChevronLeft size={20} />
            ブログ一覧に戻る
          </Link>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a2e',
              borderBottom: '2px solid #4a7c3f',
              paddingBottom: '10px',
              marginBottom: '20px',
            }}>
              関連記事
            </h2>
            <div>
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  to={`/blog/${related.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    borderBottom: '1px solid #EEEEEE',
                    padding: '18px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#4a7c3f',
                        display: 'block',
                        marginBottom: '6px',
                      }}>
                        {related.category}
                      </span>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.6 }}>
                        {related.title}
                      </p>
                    </div>
                    <ChevronRight size={22} style={{ color: '#aaa', flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
