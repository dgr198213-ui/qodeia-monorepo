import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Inicializar sesión al cargar la aplicación
  initialize: async () => {
    try {
      set({ loading: true });
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      set({ user: session?.user || null, loading: false });

      // Escuchar cambios en la autenticación
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user || null });
      });
    } catch (error) {
      console.error('Error al inicializar sesión:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Iniciar sesión
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ user: data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Iniciar sesión con Google
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Registrarse
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        loading: false,
        error: 'Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta.'
      });
      return { success: true };
    } catch (error) {
      console.error('Error al registrarse:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({ user: null, loading: false, error: null });
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Limpiar errores
  clearError: () => set({ error: null }),
}));
