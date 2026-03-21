import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Menu } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/blog';

export function BlogListPage() {
  const { openDrawer } = useDrawer();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const allPosts = getAllPosts();

  const filteredPosts = allPosts.filter((post) => {
    if (selectedCategory && post.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <SEO
        title="ピックルボールブログ - 攻略・用品・大会情報"
        description="ピックルボールのパドル選び、ルール解説、初心者向けガイド、大会情報など役立つ記事を毎日更新。"
        keywords="ピックルボール, ブログ, パドル, 初心者, ルール, 大会"
        url="/blog"
        type="website"
      />

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={openDrawer}
            className="md:hidden"
            style={{
              background: '#F0F0F0',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} style={{ color: '#1a1a2e' }} />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', color: '#1a1a2e' }}>
            PickleHub
          </h1>
          <div style={{ width: '36px' }} className="md:hidden" />
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F0F0F0',
            borderRadius: '10px',
            padding: '8px 12px',
            minWidth: '100px',
          }}>
            <BookOpen size={16} style={{ color: '#65A30D', flexShrink: 0 }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1a1a2e',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">全カテゴリ</option>
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F0F0F0',
            borderRadius: '10px',
            padding: '8px 12px',
          }}>
            <Search size={16} style={{ color: '#888888', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="記事を検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#1a1a2e',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '16px', paddingBottom: '40px' }}>
        {/* Page title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>ブログ</h2>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            {filteredPosts.length}件の記事
          </p>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <BookOpen size={48} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginTop: '16px' }}>
              {allPosts.length === 0 ? '記事はまだありません' : '記事が見つかりません'}
            </h3>
            <p style={{ color: '#888', marginTop: '8px' }}>
              {allPosts.length === 0
                ? 'まもなく記事が公開されます'
                : '検索条件を変更してみてください'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s',
                }}>
                  {/* Category banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, #4a7c3f 0%, #6abf5e 100%)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                      {post.date}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      lineHeight: 1.5,
                      marginBottom: '8px',
                    }}>
                      {post.title}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#555',
                      lineHeight: 1.6,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {post.description}
                    </p>
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#4a7c3f',
                      }}>
                        続きを読む →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
