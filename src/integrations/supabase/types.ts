export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      devices: {
        Row: {
          created_at: string | null
          firmware_version: string | null
          id: string
          ip_address: string | null
          is_online: boolean | null
          last_seen: string | null
          mac_address: string | null
          metadata: Json | null
          name: string
          room_id: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          firmware_version?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_seen?: string | null
          mac_address?: string | null
          metadata?: Json | null
          name: string
          room_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          firmware_version?: string | null
          id?: string
          ip_address?: string | null
          is_online?: boolean | null
          last_seen?: string | null
          mac_address?: string | null
          metadata?: Json | null
          name?: string
          room_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          auto_assigned: boolean | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string | null
          end_time: string
          id: string
          preferences: Json | null
          room_id: string
          seat_id: string
          start_time: string
          status: Database["public"]["Enums"]["reservation_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_assigned?: boolean | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          preferences?: Json | null
          room_id: string
          seat_id: string
          start_time: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_assigned?: boolean | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          preferences?: Json | null
          room_id?: string
          seat_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["reservation_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      room_analytics: {
        Row: {
          avg_duration_minutes: number | null
          created_at: string | null
          date: string
          hour: number
          id: string
          no_shows: number | null
          occupancy_rate: number | null
          peak_occupancy: number | null
          room_id: string
          total_reservations: number | null
        }
        Insert: {
          avg_duration_minutes?: number | null
          created_at?: string | null
          date: string
          hour: number
          id?: string
          no_shows?: number | null
          occupancy_rate?: number | null
          peak_occupancy?: number | null
          room_id: string
          total_reservations?: number | null
        }
        Update: {
          avg_duration_minutes?: number | null
          created_at?: string | null
          date?: string
          hour?: number
          id?: string
          no_shows?: number | null
          occupancy_rate?: number | null
          peak_occupancy?: number | null
          room_id?: string
          total_reservations?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_analytics_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          building: string | null
          capacity: number
          created_at: string | null
          features: Json | null
          floor: number
          id: string
          name: string
          operating_hours: Json | null
          status: Database["public"]["Enums"]["room_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          building?: string | null
          capacity?: number
          created_at?: string | null
          features?: Json | null
          floor?: number
          id?: string
          name: string
          operating_hours?: Json | null
          status?: Database["public"]["Enums"]["room_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          building?: string | null
          capacity?: number
          created_at?: string | null
          features?: Json | null
          floor?: number
          id?: string
          name?: string
          operating_hours?: Json | null
          status?: Database["public"]["Enums"]["room_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seats: {
        Row: {
          col_position: number
          created_at: string | null
          features: Json | null
          id: string
          last_occupied_at: string | null
          last_vacant_at: string | null
          room_id: string
          row_position: number
          seat_number: string
          sensor_id: string | null
          status: Database["public"]["Enums"]["seat_status"] | null
          updated_at: string | null
        }
        Insert: {
          col_position: number
          created_at?: string | null
          features?: Json | null
          id?: string
          last_occupied_at?: string | null
          last_vacant_at?: string | null
          room_id: string
          row_position: number
          seat_number: string
          sensor_id?: string | null
          status?: Database["public"]["Enums"]["seat_status"] | null
          updated_at?: string | null
        }
        Update: {
          col_position?: number
          created_at?: string | null
          features?: Json | null
          id?: string
          last_occupied_at?: string | null
          last_vacant_at?: string | null
          room_id?: string
          row_position?: number
          seat_number?: string
          sensor_id?: string | null
          status?: Database["public"]["Enums"]["seat_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          battery_level: number | null
          confidence: number | null
          id: string
          is_online: boolean | null
          rssi: number | null
          seat_id: string
          sensor_type: string
          timestamp: string | null
          value: Json
        }
        Insert: {
          battery_level?: number | null
          confidence?: number | null
          id?: string
          is_online?: boolean | null
          rssi?: number | null
          seat_id: string
          sensor_type: string
          timestamp?: string | null
          value: Json
        }
        Update: {
          battery_level?: number | null
          confidence?: number | null
          id?: string
          is_online?: boolean | null
          rssi?: number | null
          seat_id?: string
          sensor_type?: string
          timestamp?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          expires_at: string | null
          id: string
          notified_at: string | null
          preferences: Json | null
          priority: number | null
          requested_at: string | null
          room_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          notified_at?: string | null
          preferences?: Json | null
          priority?: number | null
          requested_at?: string | null
          room_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          notified_at?: string | null
          preferences?: Json | null
          priority?: number | null
          requested_at?: string | null
          room_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      reservation_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "completed"
        | "cancelled"
        | "no_show"
      room_status: "active" | "maintenance" | "closed"
      seat_status:
        | "available"
        | "reserved"
        | "occupied"
        | "offline"
        | "maintenance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      reservation_status: [
        "pending",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
        "no_show",
      ],
      room_status: ["active", "maintenance", "closed"],
      seat_status: [
        "available",
        "reserved",
        "occupied",
        "offline",
        "maintenance",
      ],
    },
  },
} as const
