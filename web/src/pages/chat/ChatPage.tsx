import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { api } from '@/services/api';
import { wsClient } from '@/services/websocket';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Loading } from '@/components/ui';
import { getDisplayName } from '@/lib/utils';
import type { Message, ChatRoom, Event } from '@/types';

// Format date for chat (e.g., "12/30 20:19")
function formatChatTime(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export function ChatPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
    return () => {
      wsClient.disconnect();
    };
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Load event and chat room in parallel
      const [eventData, roomData] = await Promise.all([
        api.getEvent(eventId!),
        api.getChatRoom(eventId!)
      ]);
      setEvent(eventData);
      setChatRoom(roomData);
      setMessages(roomData.messages || []);

      // Connect WebSocket
      const token = api.getToken();
      if (token && roomData.id) {
        wsClient.connect(roomData.id, token);
        wsClient.onMessage((message) => {
          setMessages((prev) => [...prev, message as Message]);
        });
      }
    } catch (error) {
      console.error('Failed to load chat room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !chatRoom) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      // Send via WebSocket for real-time
      if (wsClient.isConnected()) {
        wsClient.sendMessage(messageText);
      } else {
        // Fallback to REST API
        await api.sendMessage(chatRoom.id, messageText);
        await loadData();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF'
      }}>
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px'
        }}>
          <div style={{ width: '60px' }} />
          <h1 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a2e',
            textAlign: 'center',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '0 8px'
          }}>
            {event?.title || 'チャット'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1DA1F2',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            完了
          </button>
        </div>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: '100px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#9CA3AF',
            paddingTop: '48px'
          }}>
            まだメッセージがありません
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((message) => {
              const isOwn = message.user.id === user?.id;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}
                >
                  {/* Profile Image */}
                  <div
                    onClick={() => navigate(`/users/${message.user.id}`)}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Avatar
                      src={message.user.profileImage}
                      alt={getDisplayName(message.user)}
                      size="sm"
                    />
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '70%'
                  }}>
                    <div style={{
                      background: '#1DA1F2',
                      color: '#FFFFFF',
                      padding: '12px 16px',
                      borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {message.content}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      marginTop: '4px'
                    }}>
                      {formatChatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E5E5',
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid #E5E5E5',
              borderRadius: '24px',
              outline: 'none',
              background: '#F5F5F7'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: newMessage.trim() ? '#1DA1F2' : '#E5E5E5',
              color: newMessage.trim() ? '#FFFFFF' : '#9CA3AF',
              cursor: newMessage.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, color 0.2s',
              flexShrink: 0
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
