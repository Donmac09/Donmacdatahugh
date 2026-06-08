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
      app_settings: {
        Row: {
          auto_deliver_enabled: boolean
          auto_deliver_minutes: number
          id: number
          updated_at: string
        }
        Insert: {
          auto_deliver_enabled?: boolean
          auto_deliver_minutes?: number
          id?: number
          updated_at?: string
        }
        Update: {
          auto_deliver_enabled?: boolean
          auto_deliver_minutes?: number
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      network_status: {
        Row: {
          id: string
          network: Database["public"]["Enums"]["pkg_network"]
          online: boolean
          type: Database["public"]["Enums"]["pkg_type"]
        }
        Insert: {
          id?: string
          network: Database["public"]["Enums"]["pkg_network"]
          online?: boolean
          type: Database["public"]["Enums"]["pkg_type"]
        }
        Update: {
          id?: string
          network?: Database["public"]["Enums"]["pkg_network"]
          online?: boolean
          type?: Database["public"]["Enums"]["pkg_type"]
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          cost_price: number
          created_at: string
          id: string
          network: Database["public"]["Enums"]["pkg_network"]
          package_id: string
          phone: string
          ref: string
          reseller_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          cost_price: number
          created_at?: string
          id?: string
          network: Database["public"]["Enums"]["pkg_network"]
          package_id: string
          phone: string
          ref: string
          reseller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          cost_price?: number
          created_at?: string
          id?: string
          network?: Database["public"]["Enums"]["pkg_network"]
          package_id?: string
          phone?: string
          ref?: string
          reseller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          cost_price: number
          created_at: string
          enabled: boolean
          id: string
          label: string
          minutes: number | null
          network: Database["public"]["Enums"]["pkg_network"]
          sort_order: number
          type: Database["public"]["Enums"]["pkg_type"]
          volume_mb: number | null
        }
        Insert: {
          cost_price: number
          created_at?: string
          enabled?: boolean
          id?: string
          label: string
          minutes?: number | null
          network?: Database["public"]["Enums"]["pkg_network"]
          sort_order?: number
          type: Database["public"]["Enums"]["pkg_type"]
          volume_mb?: number | null
        }
        Update: {
          cost_price?: number
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          minutes?: number | null
          network?: Database["public"]["Enums"]["pkg_network"]
          sort_order?: number
          type?: Database["public"]["Enums"]["pkg_type"]
          volume_mb?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          blocked: boolean
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          reseller_id: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          reseller_id?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          reseller_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ref_codes: {
        Row: {
          code: string
          created_at: string
          used: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          used?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      reseller_prices: {
        Row: {
          id: string
          package_id: string
          price: number
          reseller_id: string
        }
        Insert: {
          id?: string
          package_id: string
          price: number
          reseller_id: string
        }
        Update: {
          id?: string
          package_id?: string
          price?: number
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_prices_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_prices_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          created_at: string
          id: string
          slug: string
          store_name: string
          updated_at: string
          user_id: string
          welcome_message: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          store_name: string
          updated_at?: string
          user_id: string
          welcome_message?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          store_name?: string
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      topups: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          method: string
          raw_message: string | null
          ref_code: string
          status: Database["public"]["Enums"]["topup_status"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          method?: string
          raw_message?: string | null
          ref_code: string
          status?: Database["public"]["Enums"]["topup_status"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          method?: string
          raw_message?: string | null
          ref_code?: string
          status?: Database["public"]["Enums"]["topup_status"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["tx_status"]
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["tx_status"]
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["tx_status"]
          type?: Database["public"]["Enums"]["tx_type"]
          user_id?: string
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
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          reseller_id: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          reseller_id: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          reseller_id?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      next_order_ref: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "reseller" | "customer"
      order_status: "pending" | "processing" | "delivered" | "failed"
      pkg_network: "mtn"
      pkg_type: "data" | "mins_data"
      topup_status: "pending" | "credited" | "rejected"
      tx_status: "pending" | "success" | "failed"
      tx_type: "credit" | "debit"
      withdrawal_status: "pending" | "accepted" | "rejected" | "paid"
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
      app_role: ["admin", "reseller", "customer"],
      order_status: ["pending", "processing", "delivered", "failed"],
      pkg_network: ["mtn"],
      pkg_type: ["data", "mins_data"],
      topup_status: ["pending", "credited", "rejected"],
      tx_status: ["pending", "success", "failed"],
      tx_type: ["credit", "debit"],
      withdrawal_status: ["pending", "accepted", "rejected", "paid"],
    },
  },
} as const
