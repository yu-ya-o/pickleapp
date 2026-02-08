// API Request/Response Types

// ============= AUTH =============
export interface GoogleSignInRequest {
  idToken: string;
}

export interface GoogleSignInResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    nickname: string | null;
    bio: string | null;
    region: string | null;
    pickleballExperience: string | null;
    gender: string | null;
    ageGroup: string | null;
    skillLevel: string | null;
    duprDoubles: number | null;
    duprSingles: number | null;
    myPaddle: string | null;
    isProfileComplete: boolean;
    instagramUrl: string | null;
    twitterUrl: string | null;
    tiktokUrl: string | null;
    lineUrl: string | null;
    battleRecords: BattleRecord[] | null;
  };
  token: string; // JWT or session token
  isNewUser: boolean;
}

export interface AppleSignInRequest {
  identityToken: string;
  userIdentifier: string;
  email?: string;
  fullName?: string;
}

export interface AppleSignInResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    nickname: string | null;
    bio: string | null;
    region: string | null;
    pickleballExperience: string | null;
    gender: string | null;
    ageGroup: string | null;
    skillLevel: string | null;
    duprDoubles: number | null;
    duprSingles: number | null;
    myPaddle: string | null;
    isProfileComplete: boolean;
    instagramUrl: string | null;
    twitterUrl: string | null;
    tiktokUrl: string | null;
    lineUrl: string | null;
    battleRecords: BattleRecord[] | null;
  };
  token: string; // JWT or session token
  isNewUser: boolean;
}

// ============= USER PROFILE =============
export interface BattleRecord {
  id: string;
  tournamentName: string;
  yearMonth: string;
  result: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
  region?: string;
  pickleballExperience?: string;
  gender?: string;
  ageGroup?: string;
  skillLevel?: string;
  duprDoubles?: number;
  duprSingles?: number;
  myPaddle?: string;
  profileImage?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
  battleRecords?: BattleRecord[];
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  profileImage: string | null;
  nickname: string | null;
  bio: string | null;
  region: string | null;
  pickleballExperience: string | null;
  gender: string | null;
  ageGroup: string | null;
  skillLevel: string | null;
  duprDoubles: number | null;
  duprSingles: number | null;
  myPaddle: string | null;
  isProfileComplete: boolean;
  instagramUrl: string | null;
  twitterUrl: string | null;
  tiktokUrl: string | null;
  lineUrl: string | null;
  battleRecords: BattleRecord[] | null;
  createdAt: string;
  updatedAt: string;
}

// ============= EVENTS =============
export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  maxParticipants: number;
  price?: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  price?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status?: 'active' | 'cancelled' | 'completed';
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  region: string | null;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  price: number | null;
  skillLevel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  reservations: ReservationResponse[];
  availableSpots: number;
  isUserReserved?: boolean;
}

// ============= RESERVATIONS =============
export interface CreateReservationRequest {
  eventId: string;
}

export interface ReservationResponse {
  id: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  eventId: string;
}

// ============= CHAT =============
export interface ChatRoomResponse {
  id: string;
  eventId: string;
  createdAt: string;
  messages: MessageResponse[];
}

export interface MessageResponse {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    nickname: string | null;
    profileImage: string | null;
  };
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'error';
  data: any;
}

export interface WSChatMessage {
  chatRoomId: string;
  message: MessageResponse;
}

// ============= ERROR =============
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// ============= TEAMS =============
export interface CreateTeamRequest {
  name: string;
  description: string;
  iconImage?: string;
  headerImage?: string;
  region?: string;
  visibility: 'public' | 'private';
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  iconImage?: string;
  headerImage?: string;
  region?: string;
  visibility?: 'public' | 'private';
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  lineUrl?: string;
}

export interface TeamResponse {
  id: string;
  name: string;
  description: string;
  iconImage: string | null;
  headerImage: string | null;
  region: string | null;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  memberCount: number;
  isUserMember?: boolean;
  userRole?: string; // "owner", "admin", "member"
  hasPendingJoinRequest?: boolean;
  members?: TeamMemberResponse[];
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  tiktokUrl?: string | null;
  lineUrl?: string | null;
}

export interface TeamMemberResponse {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member';
}

// ============= TEAM JOIN REQUESTS =============
export interface TeamJoinRequestResponse {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    iconImage: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
}

export interface ApproveJoinRequestRequest {
  action: 'approve' | 'reject';
}

// ============= TEAM INVITE URLS =============
export interface TeamInviteUrlResponse {
  id: string;
  token: string;
  inviteUrl: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  usedBy?: {
    id: string;
    name: string;
  };
}

export interface ValidateInviteResponse {
  valid: boolean;
  team?: {
    id: string;
    name: string;
    description: string;
    iconImage: string | null;
    memberCount: number;
  };
  error?: string;
}

// ============= TEAM EVENTS =============
export interface CreateTeamEventRequest {
  title: string;
  description: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number; // null = unlimited
  price?: number;
  skillLevel?: string;
  visibility?: 'public' | 'private'; // "public" = 通常イベントとしても公開, "private" = チームメンバーのみ
}

export interface UpdateTeamEventRequest {
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  price?: number;
  skillLevel?: string;
  status?: string;
  visibility?: 'public' | 'private';
}

export interface TeamEventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  startTime: string;
  endTime: string;
  maxParticipants: number | null;
  price: number | null;
  skillLevel?: string | null;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    iconImage?: string | null;
    headerImage?: string | null;
  };
  creator: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  participants: TeamEventParticipantResponse[];
  participantCount: number;
  availableSpots: number | null;
  isUserParticipating?: boolean;
}

export interface TeamEventParticipantResponse {
  id: string;
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

// ============= TOURNAMENTS =============
export interface CreateTournamentRequest {
  title: string;
  description: string;
  eventDate: string;
  organizer: string;
  venue: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  events: string;
  matchFormat: string;
  applicationDeadline: string;
  entryFee: string;
  paymentMethod: string;
  coverImage?: string;
  tournamentUrl?: string;
  contactInfo?: string;
  snsUrls?: {
    twitter?: string;
    instagram?: string;
    line?: string;
  };
}

export interface UpdateTournamentRequest {
  title?: string;
  description?: string;
  eventDate?: string;
  organizer?: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  events?: string;
  matchFormat?: string;
  applicationDeadline?: string;
  entryFee?: string;
  paymentMethod?: string;
  coverImage?: string;
  tournamentUrl?: string;
  contactInfo?: string;
  snsUrls?: {
    twitter?: string;
    instagram?: string;
    line?: string;
  };
  status?: 'active' | 'cancelled' | 'completed';
}

export interface TournamentResponse {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  organizer: string;
  venue: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  events: string;
  matchFormat: string;
  applicationDeadline: string;
  entryFee: string;
  paymentMethod: string;
  coverImage: string | null;
  tournamentUrl: string | null;
  contactInfo: string | null;
  snsUrls: {
    twitter?: string;
    instagram?: string;
    line?: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    nickname: string | null;
    profileImage: string | null;
  };
}

// ============= TEAM CHAT =============
export interface TeamChatRoomResponse {
  id: string;
  teamId: string;
  createdAt: string;
  messages: TeamMessageResponse[];
}

export interface TeamMessageResponse {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

export interface SendTeamMessageRequest {
  content: string;
}
