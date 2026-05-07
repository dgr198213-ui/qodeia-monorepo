import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'howard_credentials';
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-me';

export const SecureStorage = {
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  },

  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  },

  save(credentials) {
    const encrypted = this.encrypt(credentials);
    localStorage.setItem(STORAGE_KEY, encrypted);
  },

  load() {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    return encrypted ? this.decrypt(encrypted) : null;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
