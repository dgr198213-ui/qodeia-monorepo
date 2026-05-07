/**
 * QodeIA Unified API Client
 * Cliente API centralizado para el ecosistema QodeIA
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  repo_url?: string;
  deployment_url?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  organization_id: string;
  user_id: string;
  project_id?: string;
  type: 'chat' | 'agent' | 'ide';
  title?: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  project?: Project;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  created_at: string;
}

export interface AgentTask {
  id: string;
  organization_id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  context: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  project?: Project;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  organization_id?: string;
  display_name?: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'enterprise';
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  organization_id: string;
  source: 'notebooklm' | 'github' | 'manual';
  source_id?: string;
  title: string;
  content: string;
  content_hash?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  resource?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class QodeIAClient {
  private supabase: SupabaseClient;
  private organizationId: string;
  private token?: string;

  constructor(organizationId: string, token?: string) {
    this.organizationId = organizationId;
    this.token = token;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
  }

  // ============================================================================
  // PROJECTS
  // ============================================================================

  /**
   * Get all projects for the organization
   */
  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('organization_id', this.organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Error fetching projects', error);
    return data || [];
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', this.organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new APIError('Error fetching project', error);
    }
    return data;
  }

  /**
   * Create a new project
   */
  async createProject(project: {
    name: string;
    description?: string;
    repo_url?: string;
    deployment_url?: string;
    settings?: Record<string, any>;
  }): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        ...project,
        organization_id: this.organizationId,
        settings: project.settings || {},
      })
      .select()
      .single();

    if (error) throw new APIError('Error creating project', error);
    return data;
  }

  /**
   * Update a project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('organization_id', this.organizationId)
      .select()
      .single();

    if (error) throw new APIError('Error updating project', error);
    return data;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('organization_id', this.organizationId);

    if (error) throw new APIError('Error deleting project', error);
  }

  // ============================================================================
  // CONVERSATIONS
  // ============================================================================

  /**
   * Get all conversations for the organization
   */
  async getConversations(type?: 'chat' | 'agent' | 'ide'): Promise<Conversation[]> {
    let query = this.supabase
      .from('conversations')
      .select(`
        *,
        messages(count),
        project:projects(name)
      `)
      .eq('organization_id', this.organizationId)
      .order('updated_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw new APIError('Error fetching conversations', error);
    return data || [];
  }

  /**
   * Get a single conversation with messages
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        messages(*),
        project:projects(name)
      `)
      .eq('id', conversationId)
      .eq('organization_id', this.organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new APIError('Error fetching conversation', error);
    }
    return data;
  }

  /**
   * Create a new conversation
   */
  async createConversation(conversation: {
    type: 'chat' | 'agent' | 'ide';
    title?: string;
    project_id?: string;
    user_id: string;
    context?: Record<string, any>;
  }): Promise<Conversation> {
    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        ...conversation,
        organization_id: this.organizationId,
        context: conversation.context || {},
      })
      .select()
      .single();

    if (error) throw new APIError('Error creating conversation', error);
    return data;
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, content: string, metadata?: Record<string, any>): Promise<Message> {
    const { data: message, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'user',
        content,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw new APIError('Error sending message', error);

    // Update conversation timestamp
    await this.supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return message;
  }

  /**
   * Add an assistant message to a conversation
   */
  async addAssistantMessage(conversationId: string, content: string, metadata?: Record<string, any>): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'assistant',
        content,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw new APIError('Error adding assistant message', error);
    return data;
  }

  // ============================================================================
  // AGENT TASKS
  // ============================================================================

  /**
   * Get all agent tasks for the organization
   */
  async getAgentTasks(status?: string): Promise<AgentTask[]> {
    let query = this.supabase
      .from('agent_tasks')
      .select(`
        *,
        project:projects(name),
        user:user_profiles(display_name)
      `)
      .eq('organization_id', this.organizationId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw new APIError('Error fetching agent tasks', error);
    return data || [];
  }

  /**
   * Create a new agent task
   */
  async createAgentTask(task: {
    title: string;
    description?: string;
    project_id?: string;
    user_id: string;
    priority?: number;
    context?: Record<string, any>;
  }): Promise<AgentTask> {
    const { data, error } = await this.supabase
      .from('agent_tasks')
      .insert({
        ...task,
        organization_id: this.organizationId,
        context: task.context || {},
      })
      .select()
      .single();

    if (error) throw new APIError('Error creating agent task', error);
    return data;
  }

  /**
   * Update an agent task
   */
  async updateAgentTask(taskId: string, updates: Partial<AgentTask>): Promise<AgentTask> {
    const updateData: Record<string, any> = { ...updates };

    if (updates.status === 'completed' || updates.status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('agent_tasks')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('organization_id', this.organizationId)
      .select()
      .single();

    if (error) throw new APIError('Error updating agent task', error);
    return data;
  }

  /**
   * Cancel an agent task
   */
  async cancelAgentTask(taskId: string): Promise<AgentTask> {
    return this.updateAgentTask(taskId, { status: 'cancelled' });
  }

  // ============================================================================
  // KNOWLEDGE BASE
  // ============================================================================

  /**
   * Search the knowledge base
   */
  async searchKnowledgeBase(query: string, limit: number = 5): Promise<KnowledgeBaseEntry[]> {
    // Generate embedding for query
    const embedding = await this.generateEmbedding(query);

    // Search in knowledge base using vector similarity
    const { data, error } = await this.supabase.rpc('match_knowledge_base', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
      org_id: this.organizationId,
    });

    if (error) throw new APIError('Error searching knowledge base', error);
    return data || [];
  }

  /**
   * Add entry to knowledge base
   */
  async addToKnowledgeBase(entry: {
    source: 'notebooklm' | 'github' | 'manual';
    source_id?: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<KnowledgeBaseEntry> {
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .insert({
        ...entry,
        organization_id: this.organizationId,
        metadata: entry.metadata || {},
      })
      .select()
      .single();

    if (error) throw new APIError('Error adding to knowledge base', error);

    // Generate and store embedding asynchronously
    this.generateAndStoreEmbedding(data.id, entry.content).catch(console.error);

    return data;
  }

  /**
   * Get knowledge base entries
   */
  async getKnowledgeBaseEntries(limit: number = 50): Promise<KnowledgeBaseEntry[]> {
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .select('*')
      .eq('organization_id', this.organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new APIError('Error fetching knowledge base', error);
    return data || [];
  }

  // ============================================================================
  // ANALYTICS & USAGE
  // ============================================================================

  /**
   * Log usage
   */
  async logUsage(action: string, resource?: string, metadata?: Record<string, any>): Promise<void> {
    const { error } = await this.supabase
      .from('usage_logs')
      .insert({
        organization_id: this.organizationId,
        user_id: (await this.getCurrentUser())?.id || '',
        action,
        resource,
        metadata: metadata || {},
      });

    if (error) {
      console.error('Failed to log usage:', error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(days: number = 30): Promise<{
    total_actions: number;
    actions_by_type: Record<string, number>;
    daily_usage: { date: string; count: number }[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('usage_logs')
      .select('action, created_at')
      .eq('organization_id', this.organizationId)
      .gte('created_at', startDate.toISOString());

    if (error) throw new APIError('Error fetching usage stats', error);

    const actionsByType: Record<string, number> = {};
    const dailyUsage: Record<string, number> = {};

    data?.forEach((log) => {
      // Count by type
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // Count by day
      const day = log.created_at.split('T')[0];
      dailyUsage[day] = (dailyUsage[day] || 0) + 1;
    });

    return {
      total_actions: data?.length || 0,
      actions_by_type: actionsByType,
      daily_usage: Object.entries(dailyUsage).map(([date, count]) => ({ date, count })),
    };
  }

  // ============================================================================
  // USER & ORGANIZATION
  // ============================================================================

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { user } } = await this.supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get organization details
   */
  async getOrganization(): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', this.organizationId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', this.organizationId);

    if (error) throw new APIError('Error fetching organization members', error);
    return data || [];
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }

    const { data } = await response.json();
    return data[0].embedding;
  }

  private async generateAndStoreEmbedding(entryId: string, content: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      await this.supabase
        .from('knowledge_base')
        .update({ content_hash: embedding.join(',') })
        .eq('id', entryId);
    } catch (error) {
      console.error('Failed to generate embedding:', error);
    }
  }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class APIError extends Error {
  constructor(message: string, public error: any) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createQodeIAClient(organizationId: string, token?: string): QodeIAClient {
  return new QodeIAClient(organizationId, token);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default QodeIAClient;
