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
  };
  token: string; // JWT or session token
}

// ============= EVENTS =============
export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  maxParticipants: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  status?: 'active' | 'cancelled' | 'completed';
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
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
