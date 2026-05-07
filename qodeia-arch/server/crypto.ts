import crypto from 'crypto';

/**
 * Módulo de cifrado para almacenamiento seguro de credenciales
 * Utiliza AES-256-GCM para máxima seguridad
 */

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Cifra un valor (API Key, token, etc.)
 */
export function encryptCredential(plaintext: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  const combined = encrypted + authTag.toString('hex');

  return {
    encrypted: combined,
    iv: iv.toString('hex'),
  };
}

/**
 * Descifra un valor cifrado
 */
export function decryptCredential(encrypted: string, iv: string): string {
  try {
    const encryptedBuffer = Buffer.from(encrypted, 'hex');
    const authTag = encryptedBuffer.slice(-AUTH_TAG_LENGTH);
    const encryptedData = encryptedBuffer.slice(0, -AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt credential: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Valida que la clave de cifrado esté configurada
 */
export function validateEncryptionKey(): boolean {
  return ENCRYPTION_KEY.length === 64; // 32 bytes en hex = 64 caracteres
}
