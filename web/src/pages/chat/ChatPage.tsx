import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '@/services/api';
import { wsClient } from '@/services/websocket';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, Loading, Input } from '@/components/ui';
import { formatRelativeTime, getDisplayName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Message, ChatRoom } from '@/types';

export function ChatPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventId) {
      loadChatRoom();
    }
    return () => {
      wsClient.disconnect();
    };
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRoom = async () => {
    try {
      setIsLoading(true);
      const room = await api.getChatRoom(eventId!);
      setChatRoom(room);
      setMessages(room.messages || []);

      // Connect WebSocket
      const token = api.getToken();
      if (token && room.id) {
        wsClient.connect(room.id, token);
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
        await loadChatRoom();
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold ml-2">チャット</h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            まだメッセージがありません
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user.id === user?.id;
            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  isOwn ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {!isOwn && (
                  <Avatar
                    src={message.user.profileImage}
                    alt={getDisplayName(message.user)}
                    size="sm"
                  />
                )}
                <div
                  className={cn(
                    'max-w-[70%] flex flex-col',
                    isOwn ? 'items-end' : 'items-start'
                  )}
                >
                  {!isOwn && (
                    <span className="text-xs text-gray-400 mb-1">
                      {getDisplayName(message.user)}
                    </span>
                  )}
                  <div
                    className={cn(
                      'px-4 py-2 rounded-2xl',
                      isOwn
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-white p-4 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className={cn(
              'p-3 rounded-full transition-colors',
              newMessage.trim()
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
