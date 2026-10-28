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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      pricing_leads: {
        Row: {
          business: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          source: string | null
        }
        Insert: {
          business?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          source?: string | null
        }
        Update: {
          business?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          source?: string | null
        }
        Relationships: []
      }
      resource_leads: {
        Row: {
          access_token: string
          business_name: string | null
          business_type: string | null
          challenge: string | null
          confirm_sent_at: string | null
          confirm_token: string | null
          created_at: string
          delivered_at: string | null
          delivery_attempts: number
          delivery_status: string
          email: string
          id: string
          last_requested_at: string
          marketing_consent: boolean
          marketing_consent_at: string | null
          name: string
          nurture_day2_sent_at: string | null
          nurture_day4_sent_at: string | null
          nurture_day7_sent_at: string | null
          pending_marketing: boolean
          pending_waitlist: boolean
          request_count: number
          source: string | null
          unsubscribe_token: string
          unsubscribed_at: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          waitlist_at: string | null
          waitlist_playbook: boolean
        }
        Insert: {
          access_token?: string
          business_name?: string | null
          business_type?: string | null
          challenge?: string | null
          confirm_sent_at?: string | null
          confirm_token?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_attempts?: number
          delivery_status?: string
          email: string
          id?: string
          last_requested_at?: string
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          name: string
          nurture_day2_sent_at?: string | null
          nurture_day4_sent_at?: string | null
          nurture_day7_sent_at?: string | null
          pending_marketing?: boolean
          pending_waitlist?: boolean
          request_count?: number
          source?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          waitlist_at?: string | null
          waitlist_playbook?: boolean
        }
        Update: {
          access_token?: string
          business_name?: string | null
          business_type?: string | null
          challenge?: string | null
          confirm_sent_at?: string | null
          confirm_token?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_attempts?: number
          delivery_status?: string
          email?: string
          id?: string
          last_requested_at?: string
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          name?: string
          nurture_day2_sent_at?: string | null
          nurture_day4_sent_at?: string | null
          nurture_day7_sent_at?: string | null
          pending_marketing?: boolean
          pending_waitlist?: boolean
          request_count?: number
          source?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          waitlist_at?: string | null
          waitlist_playbook?: boolean
        }
        Relationships: []
      }
      resource_receipts: {
        Row: {
          consent_requested: boolean
          created_at: string
          delivery_status: string
          expires_at: string
          id: string
          lead_id: string
          retry_count: number
          token: string
          updated_at: string
          waitlist_requested: boolean
        }
        Insert: {
          consent_requested?: boolean
          created_at?: string
          delivery_status?: string
          expires_at?: string
          id?: string
          lead_id: string
          retry_count?: number
          token?: string
          updated_at?: string
          waitlist_requested?: boolean
        }
        Update: {
          consent_requested?: boolean
          created_at?: string
          delivery_status?: string
          expires_at?: string
          id?: string
          lead_id?: string
          retry_count?: number
          token?: string
          updated_at?: string
          waitlist_requested?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "resource_receipts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "resource_leads"
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
