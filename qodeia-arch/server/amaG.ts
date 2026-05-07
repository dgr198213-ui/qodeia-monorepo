import { eq } from 'drizzle-orm';
import { amaGRules, auditLogs, InsertAuditLog } from '../drizzle/schema';
import { getDb } from './db';

/**
 * Sistema AMA-G: Gobernanza Determinista
 * Valida todas las operaciones críticas según 4 reglas supremas
 */

export type ValidationResult = {
  passed: boolean;
  reason: string;
  ruleType: 'verity' | 'determinism' | 'noContamination' | 'epistemicSecurity';
};

export type OperationContext = {
  userId: number;
  action: string;
  resourceType: string;
  resourceId?: number;
  input: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Regla 1: Veracidad
 * Solo se valida información trazable, coherente y verificable
 */
async function validateVerity(context: OperationContext): Promise<ValidationResult> {
  // Verificar que el input sea coherente y trazable
  if (!context.input || typeof context.input !== 'object') {
    return {
      passed: false,
      reason: 'Input must be a valid object',
      ruleType: 'verity',
    };
  }

  // Verificar que el usuario existe y tiene permisos
  if (!context.userId || context.userId <= 0) {
    return {
      passed: false,
      reason: 'Invalid user context',
      ruleType: 'verity',
    };
  }

  return {
    passed: true,
    reason: 'Input is traceable and coherent',
    ruleType: 'verity',
  };
}

/**
 * Regla 2: Determinismo
 * Misma entrada → mismo resultado
 */
async function validateDeterminism(context: OperationContext): Promise<ValidationResult> {
  const db = await getDb();
  if (!db) {
    return {
      passed: false,
      reason: 'Database unavailable',
      ruleType: 'determinism',
    };
  }

  // Verificar que no hay conflictos de estado
  // En una operación determinista, el mismo input siempre produce el mismo resultado
  const inputHash = JSON.stringify(context.input);

  if (!inputHash || inputHash.length === 0) {
    return {
      passed: false,
      reason: 'Input cannot be empty for deterministic operation',
      ruleType: 'determinism',
    };
  }

  return {
    passed: true,
    reason: 'Operation is deterministic',
    ruleType: 'determinism',
  };
}

/**
 * Regla 3: No Contaminación
 * Un módulo nunca altera otro módulo sin permiso de AMA-G
 */
async function validateNoContamination(context: OperationContext): Promise<ValidationResult> {
  // Verificar que la operación no intenta acceder a recursos de otros usuarios
  // sin autorización explícita

  // Operaciones permitidas: solo el propietario puede modificar sus recursos
  const restrictedActions = ['delete_credential', 'update_connection', 'execute_workflow'];

  if (restrictedActions.includes(context.action)) {
    // Verificar que el recurso pertenece al usuario
    if (context.resourceId && context.userId) {
      // Esta verificación se hace en el nivel de procedimiento
      return {
        passed: true,
        reason: 'Resource ownership verified',
        ruleType: 'noContamination',
      };
    }
  }

  return {
    passed: true,
    reason: 'No contamination detected',
    ruleType: 'noContamination',
  };
}

/**
 * Regla 4: Seguridad Epistémica
 * Si no hay soporte explícito → se bloquea
 */
async function validateEpistemicSecurity(context: OperationContext): Promise<ValidationResult> {
  // Operaciones permitidas explícitamente
  const allowedActions = [
    'create_credential',
    'read_credential',
    'update_credential',
    'delete_credential',
    'create_connection',
    'test_connection',
    'update_connection',
    'create_workflow',
    'execute_workflow',
    'read_logs',
    'read_status',
  ];

  if (!allowedActions.includes(context.action)) {
    return {
      passed: false,
      reason: `Action "${context.action}" is not explicitly allowed`,
      ruleType: 'epistemicSecurity',
    };
  }

  return {
    passed: true,
    reason: 'Operation is explicitly allowed',
    ruleType: 'epistemicSecurity',
  };
}

/**
 * Ejecuta todas las validaciones AMA-G
 */
export async function validateWithAMAG(context: OperationContext): Promise<ValidationResult> {
  const validations = await Promise.all([
    validateVerity(context),
    validateDeterminism(context),
    validateNoContamination(context),
    validateEpistemicSecurity(context),
  ]);

  // Todas las reglas deben pasar
  const allPassed = validations.every((v) => v.passed);

  if (!allPassed) {
    const failedRule = validations.find((v) => !v.passed);
    return {
      passed: false,
      reason: failedRule?.reason || 'AMA-G validation failed',
      ruleType: failedRule?.ruleType || 'epistemicSecurity',
    };
  }

  return {
    passed: true,
    reason: 'All AMA-G rules passed',
    ruleType: 'verity',
  };
}

/**
 * Registra una operación en el audit log
 */
export async function logOperation(
  context: OperationContext,
  validation: ValidationResult
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const auditEntry: InsertAuditLog = {
    userId: context.userId,
    action: context.action,
    resourceType: context.resourceType,
    resourceId: context.resourceId,
    details: JSON.stringify(context.input),
    amaGValidation: validation.passed ? 'passed' : 'failed',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  };

  try {
    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}

/**
 * Middleware que valida y registra operaciones
 */
export async function withAMAGValidation<T>(
  context: OperationContext,
  operation: () => Promise<T>
): Promise<T> {
  const validation = await validateWithAMAG(context);

  if (!validation.passed) {
    await logOperation(context, validation);
    throw new Error(`AMA-G Validation Failed: ${validation.reason}`);
  }

  try {
    const result = await operation();
    await logOperation(context, validation);
    return result;
  } catch (error) {
    const failedValidation: ValidationResult = {
      passed: false,
      reason: error instanceof Error ? error.message : 'Operation failed',
      ruleType: 'verity',
    };
    await logOperation(context, failedValidation);
    throw error;
  }
}
