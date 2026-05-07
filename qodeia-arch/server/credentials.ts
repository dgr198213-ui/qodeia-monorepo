import { eq, and } from 'drizzle-orm';
import { credentials, Credential, InsertCredential } from '../drizzle/schema';
import { encryptCredential, decryptCredential } from './crypto';
import { getDb } from './db';

/**
 * Crea una nueva credencial cifrada
 */
export async function createCredential(
  userId: number,
  platform: 'n8n' | 'flowise' | 'github',
  name: string,
  apiKey: string
): Promise<Credential | null> {
  const db = await getDb();
  if (!db) return null;

  const { encrypted, iv } = encryptCredential(apiKey);

  const result = await db.insert(credentials).values({
    userId,
    platform,
    name,
    encryptedValue: encrypted,
    encryptionIv: iv,
    isActive: 1,
  });

  return getCredentialById(result[0].insertId);
}

/**
 * Obtiene una credencial por ID (descifrada)
 */
export async function getCredentialById(id: number): Promise<Credential | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Obtiene el valor descifrado de una credencial
 */
export async function getDecryptedCredential(id: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);
  if (result.length === 0) return null;

  const cred = result[0];
  try {
    return decryptCredential(cred.encryptedValue, cred.encryptionIv);
  } catch (error) {
    console.error('Error decrypting credential:', error);
    return null;
  }
}

/**
 * Obtiene todas las credenciales de un usuario (sin valores descifrados)
 */
export async function getUserCredentials(userId: number): Promise<Credential[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(credentials)
    .where(and(eq(credentials.userId, userId), eq(credentials.isActive, 1)));
}

/**
 * Obtiene credenciales por plataforma
 */
export async function getCredentialsByPlatform(
  userId: number,
  platform: 'n8n' | 'flowise' | 'github'
): Promise<Credential[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(credentials)
    .where(
      and(
        eq(credentials.userId, userId),
        eq(credentials.platform, platform),
        eq(credentials.isActive, 1)
      )
    );
}

/**
 * Actualiza una credencial
 */
export async function updateCredential(
  id: number,
  userId: number,
  updates: Partial<{ name: string; apiKey: string; isActive: number }>
): Promise<Credential | null> {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.name) updateData.name = updates.name;
  if (updates.apiKey) {
    const { encrypted, iv } = encryptCredential(updates.apiKey);
    updateData.encryptedValue = encrypted;
    updateData.encryptionIv = iv;
  }
  if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

  await db
    .update(credentials)
    .set(updateData)
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)));

  return getCredentialById(id);
}

/**
 * Elimina una credencial (soft delete)
 */
export async function deleteCredential(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(credentials)
    .set({ isActive: 0, updatedAt: new Date() })
    .where(and(eq(credentials.id, id), eq(credentials.userId, userId)));

  return true;
}
