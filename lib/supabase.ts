import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nbtrrmhqpopfryhqdlfd.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idHJybWhxcG9wZnJ5aHFkbGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjI3MDAsImV4cCI6MjA2ODA5ODcwMH0.zz9yBS0P1tBNaNvolkOWkrC-Y4GtVij9IgzwHA53tcI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Championship {
  id: number
  name: string
  season: string
  is_active: boolean
  created_at?: string
}

export interface Team {
  id: number
  name: string
  logo: string
  championship_id: number
  created_at?: string
}

export interface Match {
  id: number
  round: number
  date: string
  home_team: string
  away_team: string
  home_score?: number
  away_score?: number
  is_finished: boolean
  championship_id: number
  created_at?: string
}

export interface Player {
  id: number
  name: string
  team: string
  goals: number
  championship_id: number
  created_at?: string
}
