import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credenciales cifradas para integraciones externas
 */
export const credentials = mysqlTable('credentials', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: mysqlEnum('platform', ['n8n', 'flowise', 'github']).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  encryptedValue: text('encryptedValue').notNull(), // API Key cifrada
  encryptionIv: varchar('encryptionIv', { length: 32 }).notNull(), // IV para descifrado
  isActive: int('isActive').default(1).notNull(),
  lastValidated: timestamp('lastValidated'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = typeof credentials.$inferInsert;

/**
 * Conexiones configuradas a plataformas externas
 */
export const connections = mysqlTable('connections', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  credentialId: int('credentialId').notNull().references(() => credentials.id, { onDelete: 'cascade' }),
  platform: mysqlEnum('platform', ['n8n', 'flowise', 'github']).notNull(),
  baseUrl: varchar('baseUrl', { length: 512 }).notNull(),
  status: mysqlEnum('status', ['connected', 'disconnected', 'error']).default('disconnected').notNull(),
  lastHealthCheck: timestamp('lastHealthCheck'),
  errorMessage: text('errorMessage'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

/**
 * Agentes históricos del sistema
 */
export const agents = mysqlTable('agents', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  historicalFigure: varchar('historicalFigure', { length: 255 }).notNull(), // Da Vinci, Tesla, Turing, etc.
  role: varchar('role', { length: 255 }).notNull(),
  description: text('description'),
  layer: int('layer').notNull(), // Capa 2 de arquitectura
  isActive: int('isActive').default(1).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Workflows de orquestación
 */
export const workflows = mysqlTable('workflows', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  n8nWorkflowId: varchar('n8nWorkflowId', { length: 255 }),
  flowiseChatflowId: varchar('flowiseChatflowId', { length: 255 }),
  status: mysqlEnum('status', ['draft', 'active', 'paused', 'archived']).default('draft').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Ejecuciones de workflows
 */
export const executions = mysqlTable('executions', {
  id: int('id').autoincrement().primaryKey(),
  workflowId: int('workflowId').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  status: mysqlEnum('status', ['pending', 'running', 'success', 'failed']).default('pending').notNull(),
  input: text('input'), // JSON
  output: text('output'), // JSON
  errorMessage: text('errorMessage'),
  executionTime: int('executionTime'), // milliseconds
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type Execution = typeof executions.$inferSelect;
export type InsertExecution = typeof executions.$inferInsert;

/**
 * Logs de auditoría y operaciones
 */
export const auditLogs = mysqlTable('auditLogs', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 255 }).notNull(), // 'create_credential', 'execute_workflow', etc.
  resourceType: varchar('resourceType', { length: 255 }).notNull(), // 'credential', 'workflow', 'execution'
  resourceId: int('resourceId'),
  details: text('details'), // JSON con detalles de la operación
  amaGValidation: mysqlEnum('amaGValidation', ['passed', 'failed', 'blocked']).default('passed').notNull(),
  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Validaciones y reglas AMA-G
 */
export const amaGRules = mysqlTable('amaGRules', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ruleType: mysqlEnum('ruleType', ['verity', 'determinism', 'noContamination', 'epistemicSecurity']).notNull(),
  condition: text('condition').notNull(), // JSON con la lógica de validación
  isActive: int('isActive').default(1).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type AMAGRule = typeof amaGRules.$inferSelect;
export type InsertAMAGRule = typeof amaGRules.$inferInsert;

/**
 * Estado operativo en tiempo real
 */
export const operationalStatus = mysqlTable('operationalStatus', {
  id: int('id').autoincrement().primaryKey(),
  componentType: mysqlEnum('componentType', ['n8n', 'flowise', 'github', 'ama_g', 'system']).notNull(),
  status: mysqlEnum('status', ['healthy', 'degraded', 'offline']).default('offline').notNull(),
  lastHeartbeat: timestamp('lastHeartbeat'),
  metrics: text('metrics'), // JSON con métricas
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type OperationalStatus = typeof operationalStatus.$inferSelect;
export type InsertOperationalStatus = typeof operationalStatus.$inferInsert;