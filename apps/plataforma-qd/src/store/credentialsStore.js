import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key';

// Encriptar valor
const encrypt = (value) => {
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
};

// Desencriptar valor
const decrypt = (encryptedValue) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error al desencriptar:', error);
    return '';
  }
};

export const useCredentialsStore = create((set, get) => ({
  credentials: [],
  loading: false,
  error: null,

  // Cargar credenciales desde Supabase
  loadCredentials: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Desencriptar valores
      const decryptedCredentials = (data || []).map(cred => ({
        ...cred,
        value: decrypt(cred.encrypted_value)
      }));

      set({ credentials: decryptedCredentials, loading: false });
    } catch (error) {
      console.error('Error al cargar credenciales:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Añadir nueva credencial
  addCredential: async (credential) => {
    try {
      set({ loading: true, error: null });

      const encryptedValue = encrypt(credential.value);

      const { data, error } = await supabase
        .from('credentials')
        .insert([{
          name: credential.name,
          username: credential.username || null,
          encrypted_value: encryptedValue,
          category: credential.category || null,
          notes: credential.notes || null,
          icon: credential.icon || null
        }])
        .select()
        .single();

      if (error) throw error;

      const { credentials } = get();
      set({
        credentials: [{
          ...data,
          value: credential.value
        }, ...credentials],
        loading: false
      });

      return { success: true, credential: data };
    } catch (error) {
      console.error('Error al añadir credencial:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Actualizar credencial
  updateCredential: async (id, newValue) => {
    try {
      set({ loading: true, error: null });

      const encryptedValue = encrypt(newValue);

      const { data, error } = await supabase
        .from('credentials')
        .update({
          encrypted_value: encryptedValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { credentials } = get();
      set({
        credentials: credentials.map(c =>
          c.id === id ? { ...data, value: newValue } : c
        ),
        loading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar credencial:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Eliminar credencial
  deleteCredential: async (id) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { credentials } = get();
      set({
        credentials: credentials.filter(c => c.id !== id),
        loading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar credencial:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Limpiar todas las credenciales
  clearAll: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('credentials')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todas

      if (error) throw error;

      set({ credentials: [], loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error al limpiar credenciales:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Obtener valor de credencial por nombre
  getCredentialValue: (name) => {
    const { credentials } = get();
    const credential = credentials.find(c => c.name === name);
    return credential?.value || null;
  },

  // Limpiar errores
  clearError: () => set({ error: null }),
}));
