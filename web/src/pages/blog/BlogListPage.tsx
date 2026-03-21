import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Menu, ChevronRight } from 'lucide-react';
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

      {/* Mobile Header */}
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
          <h1 className="md:hidden" style={{ fontSize: '22px', fontWeight: 900, fontStyle: 'italic', color: '#1a1a2e' }}>
            PickleHub
          </h1>
          <div className="md:hidden" style={{ width: '32px' }} />
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F0F0F0',
            borderRadius: '10px',
            padding: '8px 12px',
          }}>
            <Search size={16} style={{ color: '#888', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="記事を検索..."
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

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              flexShrink: 0,
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: selectedCategory === '' ? '#1a1a2e' : '#F0F0F0',
              color: selectedCategory === '' ? '#FFFFFF' : '#555',
            }}
          >
            すべて
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              style={{
                flexShrink: 0,
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: selectedCategory === cat ? '#4a7c3f' : '#F0F0F0',
                color: selectedCategory === cat ? '#FFFFFF' : '#555',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px 48px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e' }}>
            {selectedCategory || 'すべての記事'}
          </h2>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{filteredPosts.length}件</p>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '60px' }}>
            <BookOpen size={48} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <p style={{ color: '#888', marginTop: '16px' }}>
              {allPosts.length === 0 ? 'まもなく記事が公開されます' : '記事が見つかりません'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#E5E5E5', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {filteredPosts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  borderRadius: i === 0 ? '12px 12px 0 0' : i === filteredPosts.length - 1 ? '0 0 12px 12px' : '0',
                }}>
                  {/* Number */}
                  <div style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    background: '#f0f7ee',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <BookOpen size={16} style={{ color: '#4a7c3f' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#4a7c3f',
                        background: '#f0f7ee',
                        borderRadius: '4px',
                        padding: '2px 7px',
                      }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#bbb' }}>{post.date}</span>
                    </div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1a1a2e',
                      lineHeight: 1.5,
                      marginBottom: '4px',
                    }}>
                      {post.title}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#777',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {post.description}
                    </p>
                  </div>

                  <ChevronRight size={16} style={{ color: '#ccc', flexShrink: 0, marginTop: '4px' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
