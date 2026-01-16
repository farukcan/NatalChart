import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      natal_charts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birth_date: string;
          birth_time: string;
          birth_location: string;
          latitude: number;
          longitude: number;
          timezone_offset: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['natal_charts']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      chart_bodies: {
        Row: {
          id: string;
          chart_id: string;
          name: string;
          sign: string;
          degrees: number;
          minutes: number;
          house: number;
          is_retrograde: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chart_bodies']['Row'], 'id' | 'created_at'>;
      };
      chart_aspects: {
        Row: {
          id: string;
          chart_id: string;
          body1: string;
          body2: string;
          aspect_type: string;
          aspect_degrees: number;
          orb: number;
          is_applying: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chart_aspects']['Row'], 'id' | 'created_at'>;
      };
      chart_houses: {
        Row: {
          id: string;
          chart_id: string;
          house_number: number;
          sign: string;
          cusp_degrees: number;
          cusp_minutes: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chart_houses']['Row'], 'id' | 'created_at'>;
      };
    };
  };
};
