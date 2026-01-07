// User
export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  bio?: string;
  profileImage?: string;
  region?: string;
  pickleballExperience?: string;
  gender?: string;
  skillLevel?: string;
  duprDoubles?: number;
  duprSingles?: number;
  myPaddle?: string;
  isProfileComplete: boolean;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Event
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  region: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  availableSpots: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  creator: User;
  reservations: Reservation[];
  isUserReserved: boolean;
}

// Reservation
export interface Reservation {
  id: string;
  status: string;
  user: User;
  eventId: string;
  createdAt: string;
}

// Team
export interface Team {
  id: string;
  name: string;
  description?: string;
  iconImage?: string;
  headerImage?: string;
  region?: string;
  visibility: 'public' | 'private';
  owner: TeamOwner;
  memberCount: number;
  isUserMember: boolean;
  userRole?: 'owner' | 'admin' | 'member';
  hasPendingJoinRequest: boolean;
  members?: TeamMember[];
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamOwner {
  id: string;
  name: string;
  nickname?: string;
  profileImage?: string;
}

export interface TeamMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  user: User;
  joinedAt: string;
}

// Team Event
export interface TeamEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  region: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
  price?: number;
  skillLevel?: string;
  status: string;
  visibility: 'public' | 'private';
  team: {
    id: string;
    name: string;
    iconImage?: string;
  };
  creator: {
    id: string;
    name: string;
    nickname?: string;
    profileImage?: string;
  };
  participants: TeamEventParticipant[];
  participantCount: number;
  availableSpots?: number;
  isUserParticipating: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamEventParticipant {
  id: string;
  user: User;
  joinedAt: string;
}

// Chat
export interface ChatRoom {
  id: string;
  eventId?: string;
  teamEventId?: string;
  messages: Message[];
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  user: MessageUser;
  createdAt: string;
}

export interface MessageUser {
  id: string;
  name: string;
  profileImage?: string;
  nickname?: string;
}

// Team Chat
export interface TeamChatRoom {
  id: string;
  teamId: string;
  messages: TeamMessage[];
  createdAt: string;
}

export interface TeamMessage {
  id: string;
  content: string;
  user: MessageUser;
  createdAt: string;
}

// Notification
export type NotificationType =
  | 'event_joined'
  | 'event_cancelled'
  | 'team_join_request'
  | 'team_member_left'
  | 'team_join_approved'
  | 'team_join_rejected'
  | 'event_chat_message'
  | 'team_chat_message'
  | 'event_updated'
  | 'event_cancelled_by_creator'
  | 'event_reminder'
  | 'team_role_changed'
  | 'team_event_created';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

// Team Join Request
export interface TeamJoinRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  team: {
    id: string;
    name: string;
  };
  user: User;
  createdAt: string;
  updatedAt: string;
}

// Team Invite
export interface TeamInviteUrl {
  id: string;
  token: string;
  inviteUrl: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string;
  createdAt: string;
  createdBy: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth
export interface AuthResponse {
  token: string;
  user: User;
}
