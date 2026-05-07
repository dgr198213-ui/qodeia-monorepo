// src/__tests__/SecureStorage.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecureStorage } from '../services/SecureStorage';

describe('SecureStorage', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debería cifrar y descifrar correctamente un objeto', () => {
    const data = { secret: '12345', user: 'admin' };
    const encrypted = SecureStorage.encrypt(data);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(JSON.stringify(data));

    const decrypted = SecureStorage.decrypt(encrypted);
    expect(decrypted).toEqual(data);
  });

  it('debería guardar y cargar datos desde localStorage', () => {
    const data = [{ id: 1, key: 'abc' }];
    SecureStorage.save(data);

    const loaded = SecureStorage.load();
    expect(loaded).toEqual(data);
  });

  it('debería retornar null al intentar descifrar datos inválidos', () => {
    const result = SecureStorage.decrypt('datos-invalidos-no-cifrados');
    expect(result).toBeNull();
  });

  it('debería limpiar los datos de localStorage', () => {
    SecureStorage.save({ test: true });
    SecureStorage.clear();
    expect(localStorage.getItem('howard_credentials')).toBeNull();
  });
});
