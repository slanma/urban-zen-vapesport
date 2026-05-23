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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      b2b_profiles: {
        Row: {
          address: string
          city: string
          company_name: string
          contact_person: string
          created_at: string
          dic: string | null
          discount_percent: number
          ico: string
          id: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["b2b_status"]
          updated_at: string
          user_id: string
          zip: string
        }
        Insert: {
          address: string
          city: string
          company_name: string
          contact_person: string
          created_at?: string
          dic?: string | null
          discount_percent?: number
          ico: string
          id?: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["b2b_status"]
          updated_at?: string
          user_id: string
          zip: string
        }
        Update: {
          address?: string
          city?: string
          company_name?: string
          contact_person?: string
          created_at?: string
          dic?: string | null
          discount_percent?: number
          ico?: string
          id?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["b2b_status"]
          updated_at?: string
          user_id?: string
          zip?: string
        }
        Relationships: []
      }
      product_overrides: {
        Row: {
          ai_keywords: string | null
          b2b_price: number | null
          category_override: string | null
          colors_override: Json | null
          created_at: string
          description_html: string | null
          features_override: Json | null
          in_stock: boolean
          meta_description: string | null
          meta_title: string | null
          name_override: string | null
          price_override: number | null
          product_id: string
          short_description_override: string | null
          specs_override: Json | null
          tech_params_html: string | null
          updated_at: string
          vat_percent: number
          visible: boolean
          youtube_url: string | null
        }
        Insert: {
          ai_keywords?: string | null
          b2b_price?: number | null
          category_override?: string | null
          colors_override?: Json | null
          created_at?: string
          description_html?: string | null
          features_override?: Json | null
          in_stock?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name_override?: string | null
          price_override?: number | null
          product_id: string
          short_description_override?: string | null
          specs_override?: Json | null
          tech_params_html?: string | null
          updated_at?: string
          vat_percent?: number
          visible?: boolean
          youtube_url?: string | null
        }
        Update: {
          ai_keywords?: string | null
          b2b_price?: number | null
          category_override?: string | null
          colors_override?: Json | null
          created_at?: string
          description_html?: string | null
          features_override?: Json | null
          in_stock?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name_override?: string | null
          price_override?: number | null
          product_id?: string
          short_description_override?: string | null
          specs_override?: Json | null
          tech_params_html?: string | null
          updated_at?: string
          vat_percent?: number
          visible?: boolean
          youtube_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          order_number: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          order_number: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          order_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_b2b_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["b2b_status"]
      }
      get_product_b2b_prices: {
        Args: never
        Returns: {
          b2b_price: number
          product_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      b2b_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      b2b_status: ["pending", "approved", "rejected"],
    },
  },
} as const
