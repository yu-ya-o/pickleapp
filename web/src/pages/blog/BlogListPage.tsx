import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useDrawer } from '@/contexts/DrawerContext';
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/blog';

const POSTS_PER_PAGE = 20;

export function BlogListPage() {
  const { openDrawer } = useDrawer();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
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
        borderBottom: '2px solid #4a7c3f',
        padding: '14px 20px',
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
            <Menu size={28} style={{ color: '#1a1a2e' }} />
          </button>
          <h1 className="md:hidden" style={{ fontSize: '24px', fontWeight: 900, fontStyle: 'italic', color: '#1a1a2e' }}>
            PickleHub
          </h1>
          <div className="md:hidden" style={{ width: '36px' }} />
        </div>
      </header>

      {/* Page Title */}
      <div style={{ background: '#f8fdf7', borderBottom: '1px solid #e0ede0', padding: '20px 20px 16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e', marginBottom: '12px' }}>
          ブログ記事一覧
        </h2>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#FFFFFF',
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '12px',
        }}>
          <Search size={20} style={{ color: '#888', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="記事を検索..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#1a1a2e',
              fontSize: '17px',
              outline: 'none',
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '15px',
              fontWeight: 600,
              border: '2px solid',
              cursor: 'pointer',
              borderColor: selectedCategory === '' ? '#4a7c3f' : '#ddd',
              background: selectedCategory === '' ? '#4a7c3f' : '#FFFFFF',
              color: selectedCategory === '' ? '#FFFFFF' : '#555',
            }}
          >
            すべて
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 600,
                border: '2px solid',
                cursor: 'pointer',
                borderColor: selectedCategory === cat ? '#4a7c3f' : '#ddd',
                background: selectedCategory === cat ? '#4a7c3f' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : '#555',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px 60px' }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <BookOpen size={56} style={{ color: '#CCCCCC', margin: '0 auto' }} />
            <p style={{ color: '#888', marginTop: '20px', fontSize: '18px' }}>
              {allPosts.length === 0 ? 'まもなく記事が公開されます' : '記事が見つかりません'}
            </p>
          </div>
        ) : (
          <div>
            {/* 件数表示 */}
            <p style={{ fontSize: '14px', color: '#888', padding: '16px 0 4px' }}>
              {filteredPosts.length}件中 {(currentPage - 1) * POSTS_PER_PAGE + 1}〜{Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)}件を表示
            </p>

            {paginatedPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article style={{
                  borderBottom: '1px solid #E8E8E8',
                  padding: '24px 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: '#4a7c3f',
                      borderRadius: '4px',
                      padding: '3px 12px',
                    }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '15px', color: '#999' }}>{post.date}</span>
                  </div>

                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    lineHeight: 1.6,
                    marginBottom: '10px',
                  }}>
                    {post.title}
                  </h3>

                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    lineHeight: 1.8,
                    marginBottom: '12px',
                  }}>
                    {post.description}
                  </p>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#4a7c3f',
                  }}>
                    続きを読む <ChevronRight size={18} />
                  </span>
                </article>
              </Link>
            ))}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '32px 0',
              }}>
                <button
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '2px solid',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    borderColor: currentPage === 1 ? '#ddd' : '#4a7c3f',
                    background: '#FFFFFF',
                    color: currentPage === 1 ? '#ccc' : '#4a7c3f',
                  }}
                >
                  <ChevronLeft size={18} /> 前へ
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo(0, 0); }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      border: '2px solid',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderColor: currentPage === page ? '#4a7c3f' : '#ddd',
                      background: currentPage === page ? '#4a7c3f' : '#FFFFFF',
                      color: currentPage === page ? '#FFFFFF' : '#555',
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0); }}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '2px solid',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    borderColor: currentPage === totalPages ? '#ddd' : '#4a7c3f',
                    background: '#FFFFFF',
                    color: currentPage === totalPages ? '#ccc' : '#4a7c3f',
                  }}
                >
                  次へ <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
