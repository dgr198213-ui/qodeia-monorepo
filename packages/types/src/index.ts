// @qodeia/types - Tipos compartidos

// Re-export from @qodeia/shared
export type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Agent,
  AgentInsert,
  AgentUpdate,
  Conversation,
  ConversationInsert,
  ConversationUpdate,
  Message,
  MessageInsert,
  MessageUpdate,
  ApiKey,
  ApiKeyInsert,
  ApiKeyUpdate,
  UserRole,
  AgentStatus,
  MessageRole,
} from '@qodeia/shared';

// Additional shared types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}