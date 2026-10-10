import { describe, expect, it } from 'vitest';
import { supabaseTools } from './supabase';

describe('contención P0 de herramientas Supabase', () => {
  it('no expone herramientas de Supabase', () => {
    expect(Object.keys(supabaseTools)).toEqual([]);
  });
});
