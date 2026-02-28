import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, ChevronRight, Flame, Clock, UserPlus, Medal, Menu, Search, PlusCircle, Zap } from 'lucide-react';
import { api } from '@/services/api';
import { SEO } from '@/components/SEO';
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from '@/lib/seo';
import { useDrawer } from '@/contexts/DrawerContext';
import { formatDateTime, getDisplayName } from '@/lib/utils';
import type { Event, Team, TeamEvent, Tournament } from '@/types';

// 今週末の日付範囲を取得
function getWeekendRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);

  return { saturday, sunday };
}

// ビルド時にプリレンダリングで埋め込まれた初期データを取得
interface PrerenderData {
  stats?: { eventCount: number; teamCount: number };
  events?: Event[];
  teamEvents?: TeamEvent[];
  teams?: Team[];
  tournaments?: Tournament[];
}

function getPrerenderData(): PrerenderData | null {
  try {
    const data = (window as unknown as Record<string, unknown>).__PRERENDER_DATA__ as PrerenderData | undefined;
    if (data) return data;
  } catch {
    // SSR環境ではwindowが無いので無視
  }
  return null;
}

function buildHomeData(prerenderData: PrerenderData) {
  const allEvents = prerenderData.events || [];
  const allTeamEvents = prerenderData.teamEvents || [];
  const allTeams = prerenderData.teams || [];
  const allTournaments = prerenderData.tournaments || [];

  const combinedEvents = [...allEvents, ...allTeamEvents];

  // 今週末のイベント
  const { saturday, sunday } = getWeekendRange();
  const weekend = combinedEvents.filter((event) => {
    const eventDate = new Date(event.startTime);
    return eventDate >= saturday && eventDate <= sunday;
  });

  // 新着イベント（直近追加順）
  const sorted = [...combinedEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 注目のチーム（メンバー数順）
  const sortedTeams = [...allTeams].sort((a, b) => b.memberCount - a.memberCount);

  // 参加者募集中（公開チーム）
  const publicTeams = allTeams.filter((t) => t.visibility === 'public');

  return {
    weekendEvents: weekend.slice(0, 6),
    recentEvents: sorted.slice(0, 5),
    featuredTeams: sortedTeams.slice(0, 6),
    recruitingTeams: publicTeams.slice(0, 5),
    tournaments: allTournaments.slice(0, 5),
    stats: prerenderData.stats || { eventCount: 0, teamCount: 0 },
  };
}

export function HomePage() {
  const { openDrawer } = useDrawer();

  // プリレンダリングデータがあれば即座にコンテンツ表示
  const prerenderData = getPrerenderData();
  const initialData = prerenderData ? buildHomeData(prerenderData) : null;

  const [weekendEvents, setWeekendEvents] = useState<(Event | TeamEvent)[]>(initialData?.weekendEvents || []);
  const [recentEvents, setRecentEvents] = useState<(Event | TeamEvent)[]>(initialData?.recentEvents || []);
  const [featuredTeams, setFeaturedTeams] = useState<Team[]>(initialData?.featuredTeams || []);
  const [recruitingTeams, setRecruitingTeams] = useState<Team[]>(initialData?.recruitingTeams || []);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialData?.tournaments || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [stats, setStats] = useState(initialData?.stats || { eventCount: 0, teamCount: 0 });

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const [allEvents, publicTeamEvents, allTeams, allTournaments] = await Promise.all([
        api.getEvents({ status: 'active', upcoming: true }),
        api.getPublicTeamEvents(true),
        api.getTeams({}),
        api.getTournaments({ status: 'active' }).catch(() => [] as Tournament[]),
      ]);

      // 統計データを別途取得（失敗してもページは表示）
      let statsData = { eventCount: 0, teamCount: 0 };
      try {
        statsData = await api.getStats();
      } catch (error) {
        console.error('Failed to fetch stats, using fallback:', error);
        // フォールバック: 全イベント（過去含む）を取得して計算
        try {
          const [allEventsForStats, allTeamEventsForStats] = await Promise.all([
            api.getEvents({}),
            api.getPublicTeamEvents(),
          ]);
          statsData = {
            eventCount: allEventsForStats.length + allTeamEventsForStats.length,
            teamCount: allTeams.length,
          };
        } catch {
          // 最終フォールバック: 既に取得したデータを使用
          statsData = {
            eventCount: allEvents.length + publicTeamEvents.length,
            teamCount: allTeams.length,
          };
        }
      }

      // すべてのイベントを統合
      const combinedEvents = [...allEvents, ...publicTeamEvents];

      // 今週末のイベント
      const { saturday, sunday } = getWeekendRange();
      const weekend = combinedEvents.filter((event) => {
        const eventDate = new Date(event.startTime);
        return eventDate >= saturday && eventDate <= sunday;
      });
      setWeekendEvents(weekend.slice(0, 6));

      // 新着イベント（直近追加されたもの）
      const sorted = [...combinedEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentEvents(sorted.slice(0, 5));

      // 注目のチーム（メンバー数順）
      const sortedTeams = [...allTeams].sort((a, b) => b.memberCount - a.memberCount);
      setFeaturedTeams(sortedTeams.slice(0, 6));

      // 参加者募集中（公開チーム）
      const publicTeams = allTeams.filter((t) => t.visibility === 'public');
      setRecruitingTeams(publicTeams.slice(0, 5));

      // 大会情報（新着順）
      setTournaments(allTournaments.slice(0, 5));

      setStats(statsData);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <SEO
        title="PickleHub - ピックルボールイベント・サークル募集"
        description="全国のピックルボールイベントを探して参加しよう！初心者歓迎のイベントから上級者向け大会まで。サークル募集・メンバー募集も。日本最大級のピックルボールコミュニティ。"
        keywords="ピックルボール, ピックルボール イベント, pickleball, イベント募集, サークル募集, 大会, 初心者, コミュニティ, 日本"
        url="/"
        jsonLd={[organizationJsonLd, websiteJsonLd]}
      />
      {/* Header - 他のページと統一 */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
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
              justifyContent: 'center'
            }}
          >
            <Menu size={20} style={{ color: '#1a1a2e' }} />
          </button>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#1a1a2e'
          }}>
            PickleHub
          </h1>
          <div style={{ width: '36px' }} className="md:hidden" />
        </div>
      </header>

      {/* Hero Section - A-1: 躍動感のあるヒーロー */}
      <section style={{
        background: `linear-gradient(135deg, rgba(101, 163, 13, 0.75) 0%, rgba(22, 101, 52, 0.85) 100%), url('https://images.unsplash.com/photo-1684495643649-9dc9feaa0d54?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        padding: '32px 20px 28px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '240px'
      }}>
        {/* Decorative floating balls */}
        <div className="animate-float" style={{
          position: 'absolute',
          top: '-30px',
          right: '-20px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '3px solid rgba(255,255,255,0.25)'
        }} />
        <div className="animate-float-reverse" style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,255,255,0.18)'
        }} />
        <div className="animate-float" style={{
          position: 'absolute',
          top: '40%',
          right: '15%',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          animationDelay: '1s'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '26px',
            fontWeight: 800,
            marginBottom: '8px',
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
            lineHeight: 1.3,
            letterSpacing: '-0.5px'
          }}>
            さあ、コートへ。
          </p>
          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            opacity: 0.9,
            marginBottom: '20px',
            textShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }}>
            全国のピックルボール仲間とつながろう
          </p>

          {/* Stats - A-3: 熱量が見える統計 */}
          {!isLoading && (stats.eventCount > 0 || stats.teamCount > 0) && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              <Zap size={16} style={{ color: '#FDE047' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>{stats.eventCount}</div>
                <div style={{ fontSize: '10px', fontWeight: 500, opacity: 0.85 }}>イベント開催</div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.25)'
            }}>
              <Users size={16} style={{ color: '#FDE047' }} />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>{stats.teamCount}</div>
                <div style={{ fontSize: '10px', fontWeight: 500, opacity: 0.85 }}>サークル活動中</div>
              </div>
            </div>
          </div>
          )}

          {/* A-6: Hero CTA buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/events"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FFFFFF',
                color: '#166534',
                fontWeight: 700,
                fontSize: '14px',
                padding: '10px 18px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <Search size={16} />
              イベントを探す
            </Link>
            <Link
              to="/events/create"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.2)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
                padding: '10px 18px',
                borderRadius: '12px',
                textDecoration: 'none',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s'
              }}
            >
              <PlusCircle size={16} />
              イベント作成
            </Link>
          </div>
        </div>
      </section>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* App Store Banner */}
        <a
          href="https://apps.apple.com/jp/app/picklehub-%E3%83%94%E3%83%83%E3%82%AF%E3%83%AB%E3%83%9C%E3%83%BC%E3%83%AB%E3%81%AE%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%82%B5%E3%83%BC%E3%82%AF%E3%83%AB%E6%8E%A2%E3%81%97/id6755670670"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '16px',
            padding: '16px 20px',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <img
            src="/app-icon.jpg"
            alt="PickleHub App"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#888888', marginBottom: '2px' }}>
              iOSアプリで、もっと便利に
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              App Storeでダウンロード
            </div>
          </div>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '8px',
            padding: '8px 12px',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>入手</span>
          </div>
        </a>

        {/* 今週末のイベント - A-4: セクションヘッダーに色彩強化 */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                <Flame size={16} style={{ color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>今週末のイベント</h2>
            </div>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#16A34A', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          {isLoading ? (
            <SkeletonCardRow />
          ) : weekendEvents.length === 0 ? (
            /* A-5: 空状態にCTAとイラスト */
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏓</div>
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '16px' }}>今週末のイベントはまだありません</p>
              <Link to="/events/create" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #65A30D, #16A34A)',
                color: '#FFFFFF', fontWeight: 600, fontSize: '13px',
                padding: '10px 20px', borderRadius: '10px', textDecoration: 'none'
              }}>
                <PlusCircle size={14} /> イベントを作成する
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -16px', padding: '0 16px 8px' }}>
              {weekendEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* 注目のサークル */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #65A30D, #16A34A)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                <Users size={16} style={{ color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>注目のサークル</h2>
            </div>
            <Link to="/teams" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#16A34A', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          {isLoading ? (
            <SkeletonCardRow />
          ) : featuredTeams.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
              <p style={{ fontSize: '14px', color: '#666666', marginBottom: '16px' }}>サークルはまだありません</p>
              <Link to="/teams" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #65A30D, #16A34A)',
                color: '#FFFFFF', fontWeight: 600, fontSize: '13px',
                padding: '10px 20px', borderRadius: '10px', textDecoration: 'none'
              }}>
                <Search size={14} /> サークルを探す
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -16px', padding: '0 16px 8px' }}>
              {featuredTeams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </section>

        {/* 大会情報 */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                <Medal size={16} style={{ color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>大会情報</h2>
            </div>
            <Link to="/tournaments" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#16A34A', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <SkeletonListRows />
            ) : tournaments.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</div>
                <p style={{ fontSize: '14px', color: '#666666' }}>大会情報はまだありません</p>
              </div>
            ) : (
              tournaments.map((tournament, index) => (
                <TournamentListItem key={tournament.id} tournament={tournament} isLast={index === tournaments.length - 1} />
              ))
            )}
          </div>
        </section>

        {/* 地域から探す */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
              <MapPin size={16} style={{ color: '#FFFFFF' }} />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>地域から探す</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['東京都', '神奈川県', '大阪府', '愛知県', '埼玉県', '千葉県', '兵庫県', '北海道', '福岡県', '静岡県', '茨城県', '広島県'].map((pref) => (
              <Link
                key={pref}
                to={`/events?region=${encodeURIComponent(pref)}`}
                style={{
                  padding: '8px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1a1a2e',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {pref}
              </Link>
            ))}
            <Link
              to="/events"
              style={{
                padding: '8px 14px',
                background: '#F0F0F0',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#666666',
                textDecoration: 'none'
              }}
            >
              すべて見る...
            </Link>
          </div>
        </section>

        {/* 新着イベント */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                <Clock size={16} style={{ color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>新着イベント</h2>
            </div>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#16A34A', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <SkeletonListRows />
            ) : recentEvents.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                <p style={{ fontSize: '14px', color: '#666666', marginBottom: '16px' }}>イベントはまだありません</p>
                <Link to="/events/create" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, #65A30D, #16A34A)',
                  color: '#FFFFFF', fontWeight: 600, fontSize: '13px',
                  padding: '10px 20px', borderRadius: '10px', textDecoration: 'none'
                }}>
                  <PlusCircle size={14} /> 最初のイベントを作成
                </Link>
              </div>
            ) : (
              recentEvents.map((event, index) => (
                <EventListItem key={event.id} event={event} isLast={index === recentEvents.length - 1} />
              ))
            )}
          </div>
        </section>

        {/* メンバー募集中サークル */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: '8px', padding: '4px', display: 'flex' }}>
                <UserPlus size={16} style={{ color: '#FFFFFF' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>メンバー募集中</h2>
            </div>
            <Link to="/teams" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#16A34A', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <SkeletonListRows />
            ) : recruitingTeams.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤝</div>
                <p style={{ fontSize: '14px', color: '#666666' }}>募集中のサークルはありません</p>
              </div>
            ) : (
              recruitingTeams.map((team, index) => (
                <TeamListItem key={team.id} team={team} isLast={index === recruitingTeams.length - 1} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// スケルトン: 横スクロールカード用
function SkeletonCardRow() {
  return (
    <div style={{ display: 'flex', gap: '12px', overflow: 'hidden', margin: '0 -16px', padding: '0 16px' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          background: '#FFFFFF', borderRadius: '16px', padding: '14px',
          minWidth: '260px', border: '1px solid #F0F0F0'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '12px', width: '50%', marginBottom: '4px' }} />
              <div className="skeleton" style={{ height: '12px', width: '40%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// スケルトン: 縦リスト用
function SkeletonListRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px', borderBottom: i < 2 ? '1px solid #F0F0F0' : 'none'
        }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '6px' }} />
            <div className="skeleton" style={{ height: '12px', width: '40%' }} />
          </div>
        </div>
      ))}
    </>
  );
}

// スキルレベルのラベルと色
const SKILL_LEVEL_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  all: { label: '全レベル', bg: '#F0FDF4', color: '#16A34A' },
  beginner: { label: '初心者歓迎', bg: '#EFF6FF', color: '#2563EB' },
  intermediate: { label: '中級者向け', bg: '#FFF7ED', color: '#EA580C' },
  advanced: { label: '上級者向け', bg: '#FEF2F2', color: '#DC2626' },
};

// イベントカード（横スクロール用）- A-2/A-3: 残枠・レベルバッジ追加
function EventCard({ event }: { event: Event | TeamEvent }) {
  const isTeamEvent = 'team' in event;
  const linkTo = isTeamEvent
    ? `/teams/${(event as TeamEvent).team.id}/events/${event.id}`
    : `/events/${event.id}`;
  const displayImage = isTeamEvent
    ? (event as TeamEvent).team.iconImage
    : event.creator.profileImage;
  const displayName = isTeamEvent
    ? (event as TeamEvent).team.name
    : getDisplayName(event.creator);

  const spotsInfo = !isTeamEvent && event.maxParticipants > 0 ? {
    available: event.availableSpots,
    total: event.maxParticipants,
    isAlmostFull: event.availableSpots <= 3 && event.availableSpots > 0,
    isFull: event.availableSpots === 0,
  } : null;

  const skillConfig = !isTeamEvent ? SKILL_LEVEL_CONFIG[event.skillLevel] || SKILL_LEVEL_CONFIG.all : null;

  return (
    <Link
      to={linkTo}
      className="hover-lift"
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '14px',
        minWidth: '260px',
        textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: spotsInfo?.isAlmostFull ? '1.5px solid #FDE68A' : '1px solid #F0F0F0',
        position: 'relative'
      }}
    >
      {/* A-3: 残枠バッジ */}
      {spotsInfo && (spotsInfo.isAlmostFull || spotsInfo.isFull) && (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          background: spotsInfo.isFull ? '#FEE2E2' : '#FEF3C7',
          color: spotsInfo.isFull ? '#DC2626' : '#D97706',
          fontSize: '10px', fontWeight: 700,
          padding: '2px 8px', borderRadius: '10px'
        }}>
          {spotsInfo.isFull ? '満員' : `残り${spotsInfo.available}枠`}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {displayImage ? (
            <img src={displayImage} alt={displayName} width={44} height={44} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '18px' }}>🏓</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a2e',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <Calendar size={12} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: '12px', color: '#555555' }}>{formatDateTime(event.startTime)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} style={{ color: '#16A34A' }} />
            <span style={{ fontSize: '12px', color: '#555555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </span>
          </div>
        </div>
      </div>
      {/* A-2: スキルレベル + 参加状況バー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F5F5F5' }}>
        {skillConfig && (
          <span style={{
            fontSize: '10px', fontWeight: 600,
            background: skillConfig.bg, color: skillConfig.color,
            padding: '2px 8px', borderRadius: '8px'
          }}>
            {skillConfig.label}
          </span>
        )}
        {spotsInfo && !spotsInfo.isFull && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={10} style={{ color: '#888888' }} />
            <span style={{ fontSize: '10px', color: '#888888' }}>
              {spotsInfo.total - spotsInfo.available}/{spotsInfo.total}人
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// サークルカード（横スクロール用）- A-2: メンバー数・地域の視覚強化
function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="hover-lift"
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '14px',
        minWidth: '200px',
        textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #F0F0F0'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {team.iconImage ? (
            <img src={team.iconImage} alt={team.name} width={44} height={44} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '18px' }}>🏓</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a2e',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {team.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Users size={12} style={{ color: '#16A34A' }} />
              <span style={{ fontSize: '12px', color: '#555555', fontWeight: 500 }}>{team.memberCount}人</span>
            </div>
            {team.region && (
              <span style={{ fontSize: '11px', color: '#888888' }}>{team.region}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// イベントリストアイテム（縦リスト用）- A-3: 残枠バッジ追加
function EventListItem({ event, isLast }: { event: Event | TeamEvent; isLast: boolean }) {
  const isTeamEvent = 'team' in event;
  const linkTo = isTeamEvent
    ? `/teams/${(event as TeamEvent).team.id}/events/${event.id}`
    : `/events/${event.id}`;
  const displayImage = isTeamEvent
    ? (event as TeamEvent).team.iconImage
    : event.creator.profileImage;
  const displayName = isTeamEvent
    ? (event as TeamEvent).team.name
    : getDisplayName(event.creator);

  const spotsInfo = !isTeamEvent && event.maxParticipants > 0 ? {
    available: event.availableSpots,
    isAlmostFull: event.availableSpots <= 3 && event.availableSpots > 0,
    isFull: event.availableSpots === 0,
  } : null;

  return (
    <Link
      to={linkTo}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid #F0F0F0',
        textDecoration: 'none',
        transition: 'background 0.15s'
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {displayImage ? (
          <img src={displayImage} alt={displayName} width={40} height={40} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '16px' }}>🏓</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.title}
        </h4>
        <p style={{ fontSize: '12px', color: '#555555' }}>
          {formatDateTime(event.startTime)} / {event.location.split(' ')[0]}
        </p>
      </div>
      {spotsInfo && (spotsInfo.isAlmostFull || spotsInfo.isFull) ? (
        <span style={{
          fontSize: '10px', fontWeight: 700, flexShrink: 0,
          background: spotsInfo.isFull ? '#FEE2E2' : '#FEF3C7',
          color: spotsInfo.isFull ? '#DC2626' : '#D97706',
          padding: '2px 8px', borderRadius: '10px'
        }}>
          {spotsInfo.isFull ? '満員' : `残${spotsInfo.available}`}
        </span>
      ) : (
        <ChevronRight size={16} style={{ color: '#CCCCCC', flexShrink: 0 }} />
      )}
    </Link>
  );
}

// 大会リストアイテム（縦リスト用）
function TournamentListItem({ tournament, isLast }: { tournament: Tournament; isLast: boolean }) {
  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid #F0F0F0',
        textDecoration: 'none'
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {tournament.coverImage ? (
          <img src={tournament.coverImage} alt={tournament.title} width={40} height={40} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Medal size={18} style={{ color: '#FFFFFF' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tournament.title}
        </h4>
        <p style={{ fontSize: '12px', color: '#888888' }}>
          {tournament.eventDate} / {tournament.venue}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: '#CCCCCC', flexShrink: 0 }} />
    </Link>
  );
}

// サークルリストアイテム（縦リスト用）
function TeamListItem({ team, isLast }: { team: Team; isLast: boolean }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid #F0F0F0',
        textDecoration: 'none'
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {team.iconImage ? (
          <img src={team.iconImage} alt={team.name} width={40} height={40} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '16px' }}>🏓</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {team.name}
        </h4>
        <p style={{ fontSize: '12px', color: '#888888' }}>
          {team.region || '地域未設定'} / {team.memberCount}人
        </p>
      </div>
      <ChevronRight size={16} style={{ color: '#CCCCCC', flexShrink: 0 }} />
    </Link>
  );
}
