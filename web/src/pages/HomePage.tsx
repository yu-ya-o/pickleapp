import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, ChevronRight, Flame, Clock, UserPlus, Medal, Menu } from 'lucide-react';
import { api } from '@/services/api';
import { SEO } from '@/components/SEO';
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from '@/lib/seo';
import { useDrawer } from '@/contexts/DrawerContext';
import { formatDateTime, getDisplayName } from '@/lib/utils';
import { PREFECTURES } from '@/lib/prefectures';
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
function getPrerenderStats(): { eventCount: number; teamCount: number } {
  try {
    const data = (window as Record<string, unknown>).__PRERENDER_DATA__ as { stats?: { eventCount: number; teamCount: number } } | undefined;
    if (data?.stats && data.stats.eventCount > 0) {
      return data.stats;
    }
  } catch {
    // SSR環境ではwindowが無いので無視
  }
  return { eventCount: 0, teamCount: 0 };
}

export function HomePage() {
  const { openDrawer } = useDrawer();
  const [weekendEvents, setWeekendEvents] = useState<(Event | TeamEvent)[]>([]);
  const [recentEvents, setRecentEvents] = useState<(Event | TeamEvent)[]>([]);
  const [featuredTeams, setFeaturedTeams] = useState<Team[]>([]);
  const [recruitingTeams, setRecruitingTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(getPrerenderStats);

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

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, rgba(163, 230, 53, 0.9) 0%, rgba(101, 163, 13, 0.95) 100%), url('https://images.unsplash.com/photo-1684495643649-9dc9feaa0d54?auto=format&fit=crop&w=1200&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        padding: '40px 20px 100px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px'
      }}>
        {/* Pickleball pattern background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, #fff 8px, transparent 8px),
            radial-gradient(circle at 80% 20%, #fff 12px, transparent 12px),
            radial-gradient(circle at 60% 70%, #fff 6px, transparent 6px),
            radial-gradient(circle at 10% 80%, #fff 10px, transparent 10px),
            radial-gradient(circle at 90% 60%, #fff 7px, transparent 7px),
            radial-gradient(circle at 40% 10%, #fff 5px, transparent 5px),
            radial-gradient(circle at 70% 90%, #fff 9px, transparent 9px),
            radial-gradient(circle at 30% 50%, #fff 4px, transparent 4px)
          `,
          pointerEvents: 'none'
        }} />

        {/* Decorative ball */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '3px solid rgba(255,255,255,0.2)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,255,255,0.15)'
        }} />

        <p style={{
          fontSize: '24px',
          fontWeight: 700,
          opacity: 1,
          marginBottom: '32px',
          textShadow: '0 2px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 1,
          lineHeight: 1.4
        }}>
          全国のピックルボール情報、<br />まるっとここに。
        </p>

        {/* Stats - データ読み込み後のみ表示 */}
        {!isLoading && (stats.eventCount > 0 || stats.teamCount > 0) && (
        <div style={{ display: 'flex', gap: '8px', position: 'absolute', left: '20px', bottom: '20px', zIndex: 1 }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            width: '64px',
            height: '64px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #65A30D 0%, #3f6212 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1
            }}>
              {stats.eventCount}
            </div>
            <div style={{ fontSize: '9px', color: '#666666', fontWeight: 500, marginTop: '2px' }}>イベント</div>
          </div>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            width: '64px',
            height: '64px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1
            }}>
              {stats.teamCount}
            </div>
            <div style={{ fontSize: '9px', color: '#666666', fontWeight: 500, marginTop: '2px' }}>サークル</div>
          </div>
        </div>
        )}
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

        {/* 今週末のイベント */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} style={{ color: '#F59E0B' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>今週末のイベント</h2>
            </div>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#65A30D', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          {isLoading ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#888888' }}>
              <p>今週末開催予定のピックルボールイベントを表示します。初心者歓迎のイベントや練習会、上級者向けトーナメントまで幅広く掲載中。</p>
            </div>
          ) : weekendEvents.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#888888' }}>
              今週末のイベントはまだありません
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
              <Users size={20} style={{ color: '#65A30D' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>注目のサークル</h2>
            </div>
            <Link to="/teams" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#65A30D', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          {isLoading ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#888888' }}>
              <p>全国のピックルボールサークル・チームを表示します。メンバー募集中のサークルに参加して、一緒にプレイしましょう。</p>
            </div>
          ) : featuredTeams.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#888888' }}>
              サークルはまだありません
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
              <Medal size={20} style={{ color: '#F59E0B' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>大会情報</h2>
            </div>
            <Link to="/tournaments" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#65A30D', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888888' }}>
                <p>全国のピックルボール大会・トーナメント情報を表示します。最新の大会スケジュールをチェックしよう。</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888888' }}>
                大会情報はまだありません
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
            <MapPin size={20} style={{ color: '#EC4899' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>地域から探す</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PREFECTURES.slice(0, 12).map((pref) => (
              <Link
                key={pref}
                to={`/events?region=${encodeURIComponent(pref)}`}
                style={{
                  padding: '8px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  borderRadius: '20px',
                  fontSize: '13px',
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
                color: '#888888',
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
              <Clock size={20} style={{ color: '#10B981' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>新着イベント</h2>
            </div>
            <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#65A30D', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888888' }}>
                <p>最近追加されたピックルボールイベントを表示します。新しいイベントが毎日掲載されています。</p>
              </div>
            ) : recentEvents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888888' }}>
                イベントはまだありません
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
              <UserPlus size={20} style={{ color: '#3B82F6' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>メンバー募集中</h2>
            </div>
            <Link to="/teams" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#65A30D', textDecoration: 'none' }}>
              もっと見る
              <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888888' }}>
                <p>メンバー募集中のピックルボールサークルを表示します。初心者から上級者まで、あなたに合ったサークルが見つかります。</p>
              </div>
            ) : recruitingTeams.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888888' }}>
                募集中のサークルはありません
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

// イベントカード（横スクロール用）
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

  return (
    <Link
      to={linkTo}
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '14px',
        minWidth: '260px',
        textDecoration: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
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
            <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <Calendar size={12} style={{ color: '#65A30D' }} />
            <span style={{ fontSize: '12px', color: '#888888' }}>{formatDateTime(event.startTime)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} style={{ color: '#65A30D' }} />
            <span style={{ fontSize: '12px', color: '#888888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// サークルカード（横スクロール用）
function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      style={{
        display: 'block',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '14px',
        minWidth: '200px',
        textDecoration: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
            <img src={team.iconImage} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} style={{ color: '#65A30D' }} />
            <span style={{ fontSize: '12px', color: '#888888' }}>{team.memberCount}人</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// イベントリストアイテム（縦リスト用）
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

  return (
    <Link
      to={linkTo}
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
        {displayImage ? (
          <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '16px' }}>🏓</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.title}
        </h4>
        <p style={{ fontSize: '12px', color: '#888888' }}>
          {formatDateTime(event.startTime)} / {event.location.split(' ')[0]}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: '#CCCCCC', flexShrink: 0 }} />
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
          <img src={tournament.coverImage} alt={tournament.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          <img src={team.iconImage} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
