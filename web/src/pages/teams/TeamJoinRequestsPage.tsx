import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/services/api';
import { Avatar, Loading } from '@/components/ui';
import { getDisplayName } from '@/lib/utils';

interface JoinRequest {
  id: string;
  user: {
    id: string;
    name: string;
    nickname?: string;
    profileImage?: string;
  };
  createdAt: string;
}

export function TeamJoinRequestsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (teamId) {
      loadRequests();
    }
  }, [teamId]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await api.getJoinRequests(teamId!);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await api.handleJoinRequest(teamId!, requestId, 'approved');
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await api.handleJoinRequest(teamId!, requestId, 'rejected');
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="flex items-center justify-between" style={{ padding: '12px 16px' }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[var(--primary)] font-medium"
          >
            <ChevronLeft size={24} />
            <span>前の画面に戻る</span>
          </button>
          <h1 className="font-semibold text-lg absolute left-1/2 transform -translate-x-1/2">参加リクエスト</h1>
          <div style={{ width: '60px' }} />
        </div>
      </header>

      {/* Requests List */}
      <div style={{ padding: '16px' }}>
        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm text-center" style={{ padding: '40px 20px' }}>
            参加リクエストはありません
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl"
                style={{ padding: '16px' }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={request.user.profileImage}
                    alt={getDisplayName(request.user)}
                    size="lg"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{getDisplayName(request.user)}</span>
                    <p className="text-gray-400 text-sm">
                      リクエスト日: {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3" style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 font-medium rounded-xl disabled:opacity-50"
                    style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px' }}
                  >
                    拒否
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 font-medium rounded-xl text-white disabled:opacity-50"
                    style={{ backgroundColor: '#22C55E', padding: '12px' }}
                  >
                    承認
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
