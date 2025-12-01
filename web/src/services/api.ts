import { config } from '@/lib/config';
import type {
  User,
  Event,
  Team,
  TeamEvent,
  ChatRoom,
  TeamChatRoom,
  Notification,
  TeamJoinRequest,
  TeamInviteUrl,
  TeamMember,
  AuthResponse,
} from '@/types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async signInWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    this.setToken(response.token);
    return response;
  }

  // Profile
  async getProfile(): Promise<User> {
    return this.request<User>('/api/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseUrl}/api/upload/image`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  }

  async deleteAccount(): Promise<void> {
    await this.request('/api/account/delete', {
      method: 'DELETE',
    });
    this.setToken(null);
  }

  // Events
  async getEvents(params?: {
    status?: string;
    upcoming?: boolean;
    region?: string;
    search?: string;
  }): Promise<Event[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.upcoming) searchParams.set('upcoming', 'true');
    if (params?.region) searchParams.set('region', params.region);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return this.request<Event[]>(`/api/events${query ? `?${query}` : ''}`);
  }

  async getEvent(id: string): Promise<Event> {
    return this.request<Event>(`/api/events/${id}`);
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    return this.request<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return this.request<Event>(`/api/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    await this.request(`/api/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Reservations
  async getMyReservations(): Promise<Event[]> {
    return this.request<Event[]>('/api/reservations');
  }

  async createReservation(eventId: string): Promise<void> {
    await this.request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  }

  async cancelReservation(reservationId: string): Promise<void> {
    await this.request(`/api/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async getTeams(params?: {
    myTeams?: boolean;
    search?: string;
    region?: string;
  }): Promise<Team[]> {
    const searchParams = new URLSearchParams();
    if (params?.myTeams) searchParams.set('myTeams', 'true');
    if (params?.search) searchParams.set('search', params.search);
    if (params?.region) searchParams.set('region', params.region);

    const query = searchParams.toString();
    return this.request<Team[]>(`/api/teams${query ? `?${query}` : ''}`);
  }

  async getTeam(id: string): Promise<Team> {
    return this.request<Team>(`/api/teams/${id}`);
  }

  async createTeam(data: Partial<Team>): Promise<Team> {
    return this.request<Team>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    return this.request<Team>(`/api/teams/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: string): Promise<void> {
    await this.request(`/api/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Team Members
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.request<TeamMember[]>(`/api/teams/${teamId}/members`);
  }

  async updateMemberRole(
    teamId: string,
    userId: string,
    role: string
  ): Promise<void> {
    await this.request(`/api/teams/${teamId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.request(`/api/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Team Join Requests
  async getJoinRequests(teamId: string): Promise<TeamJoinRequest[]> {
    return this.request<TeamJoinRequest[]>(`/api/teams/${teamId}/join-requests`);
  }

  async requestToJoin(teamId: string): Promise<void> {
    await this.request(`/api/teams/${teamId}/join-requests`, {
      method: 'POST',
    });
  }

  async handleJoinRequest(
    teamId: string,
    requestId: string,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    await this.request(`/api/teams/${teamId}/join-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Team Invites
  async getTeamInvites(teamId: string): Promise<TeamInviteUrl[]> {
    return this.request<TeamInviteUrl[]>(`/api/teams/${teamId}/invites`);
  }

  async createTeamInvite(teamId: string): Promise<TeamInviteUrl> {
    return this.request<TeamInviteUrl>(`/api/teams/${teamId}/invites`, {
      method: 'POST',
    });
  }

  async validateInvite(token: string): Promise<{ team: Team; valid: boolean }> {
    return this.request(`/api/teams/invites/${token}`);
  }

  async useInvite(token: string): Promise<void> {
    await this.request(`/api/teams/invites/${token}`, {
      method: 'POST',
    });
  }

  // Team Events
  async getTeamEvents(teamId: string): Promise<TeamEvent[]> {
    return this.request<TeamEvent[]>(`/api/teams/${teamId}/events`);
  }

  async getTeamEvent(teamId: string, eventId: string): Promise<TeamEvent> {
    return this.request<TeamEvent>(`/api/teams/${teamId}/events/${eventId}`);
  }

  async createTeamEvent(teamId: string, data: Partial<TeamEvent>): Promise<TeamEvent> {
    return this.request<TeamEvent>(`/api/teams/${teamId}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeamEvent(
    teamId: string,
    eventId: string,
    data: Partial<TeamEvent>
  ): Promise<TeamEvent> {
    return this.request<TeamEvent>(`/api/teams/${teamId}/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTeamEvent(teamId: string, eventId: string): Promise<void> {
    await this.request(`/api/teams/${teamId}/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async joinTeamEvent(teamId: string, eventId: string): Promise<void> {
    await this.request(`/api/teams/${teamId}/events/${eventId}/join`, {
      method: 'POST',
    });
  }

  async leaveTeamEvent(teamId: string, eventId: string): Promise<void> {
    await this.request(`/api/teams/${teamId}/events/${eventId}/join`, {
      method: 'DELETE',
    });
  }

  async getMyTeamEvents(upcoming?: boolean): Promise<TeamEvent[]> {
    const params = upcoming ? '?upcoming=true' : '';
    return this.request<TeamEvent[]>(`/api/my-team-events${params}`);
  }

  async getPublicTeamEvents(upcoming?: boolean): Promise<TeamEvent[]> {
    const params = upcoming ? '?upcoming=true' : '';
    return this.request<TeamEvent[]>(`/api/public-team-events${params}`);
  }

  // Chat (Events)
  async getChatRoom(eventId: string): Promise<ChatRoom> {
    return this.request<ChatRoom>(`/api/chat/rooms/${eventId}`);
  }

  async sendMessage(chatRoomId: string, content: string): Promise<void> {
    await this.request('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ chatRoomId, content }),
    });
  }

  // Team Chat
  async getTeamChatRoom(teamId: string): Promise<TeamChatRoom> {
    return this.request<TeamChatRoom>(`/api/teams/${teamId}/chat`);
  }

  async sendTeamMessage(teamId: string, content: string): Promise<void> {
    await this.request(`/api/teams/${teamId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/api/notifications');
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}?action=read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.request('/api/notifications?action=read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
