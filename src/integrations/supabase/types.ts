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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      crm_cards: {
        Row: {
          assigned_to: string | null
          checklist: Json | null
          client: string
          column_id: string
          created_at: string
          deal_value: number | null
          description: string | null
          due_date: string | null
          email: string | null
          id: string
          labels: Json | null
          lead_source: string | null
          phone: string | null
          priority: string
          probability: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          checklist?: Json | null
          client: string
          column_id: string
          created_at?: string
          deal_value?: number | null
          description?: string | null
          due_date?: string | null
          email?: string | null
          id?: string
          labels?: Json | null
          lead_source?: string | null
          phone?: string | null
          priority?: string
          probability?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          checklist?: Json | null
          client?: string
          column_id?: string
          created_at?: string
          deal_value?: number | null
          description?: string | null
          due_date?: string | null
          email?: string | null
          id?: string
          labels?: Json | null
          lead_source?: string | null
          phone?: string | null
          priority?: string
          probability?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "crm_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_columns: {
        Row: {
          created_at: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      miles_inventory: {
        Row: {
          cost_per_thousand: number
          created_at: string
          id: string
          program_id: string
          purchase_date: string
          purchase_value: number
          quantity: number
          remaining_quantity: number
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          cost_per_thousand: number
          created_at?: string
          id?: string
          program_id: string
          purchase_date?: string
          purchase_value: number
          quantity: number
          remaining_quantity?: number
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          cost_per_thousand?: number
          created_at?: string
          id?: string
          program_id?: string
          purchase_date?: string
          purchase_value?: number
          quantity?: number
          remaining_quantity?: number
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "miles_inventory_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "miles_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miles_inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      miles_programs: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      miles_transactions: {
        Row: {
          cost_per_thousand: number
          created_at: string
          description: string | null
          id: string
          miles_inventory_id: string | null
          quantity: number
          sale_id: string | null
          total_value: number
          type: string
        }
        Insert: {
          cost_per_thousand: number
          created_at?: string
          description?: string | null
          id?: string
          miles_inventory_id?: string | null
          quantity: number
          sale_id?: string | null
          total_value: number
          type: string
        }
        Update: {
          cost_per_thousand?: number
          created_at?: string
          description?: string | null
          id?: string
          miles_inventory_id?: string | null
          quantity?: number
          sale_id?: string | null
          total_value?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "miles_transactions_miles_inventory_id_fkey"
            columns: ["miles_inventory_id"]
            isOneToOne: false
            referencedRelation: "miles_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      sale_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          paid_date: string | null
          sale_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          paid_date?: string | null
          sale_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          paid_date?: string | null
          sale_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_installments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_products: {
        Row: {
          airline: string | null
          card_taxes: string | null
          checkin_date: string | null
          checkout_date: string | null
          cost: number | null
          coverage_type: string | null
          created_at: string
          departure_date: string | null
          destination: string | null
          details: string | null
          fornecedor: string | null
          id: string
          locator: string | null
          miles: number | null
          miles_cost: number | null
          name: string
          origin: string | null
          passengers: string | null
          price: number
          quantity: number
          rental_period: string | null
          return_date: string | null
          sale_id: string
          supplier_id: string | null
          tax_value: number | null
          type: string
          vehicle_category: string | null
        }
        Insert: {
          airline?: string | null
          card_taxes?: string | null
          checkin_date?: string | null
          checkout_date?: string | null
          cost?: number | null
          coverage_type?: string | null
          created_at?: string
          departure_date?: string | null
          destination?: string | null
          details?: string | null
          fornecedor?: string | null
          id?: string
          locator?: string | null
          miles?: number | null
          miles_cost?: number | null
          name: string
          origin?: string | null
          passengers?: string | null
          price: number
          quantity?: number
          rental_period?: string | null
          return_date?: string | null
          sale_id: string
          supplier_id?: string | null
          tax_value?: number | null
          type: string
          vehicle_category?: string | null
        }
        Update: {
          airline?: string | null
          card_taxes?: string | null
          checkin_date?: string | null
          checkout_date?: string | null
          cost?: number | null
          coverage_type?: string | null
          created_at?: string
          departure_date?: string | null
          destination?: string | null
          details?: string | null
          fornecedor?: string | null
          id?: string
          locator?: string | null
          miles?: number | null
          miles_cost?: number | null
          name?: string
          origin?: string | null
          passengers?: string | null
          price?: number
          quantity?: number
          rental_period?: string | null
          return_date?: string | null
          sale_id?: string
          supplier_id?: string | null
          tax_value?: number | null
          type?: string
          vehicle_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_products_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          anticipation_date: string | null
          client_id: string | null
          client_name: string
          created_at: string
          gross_profit: number | null
          has_anticipation: boolean | null
          id: string
          installments: number | null
          miles_cost: number | null
          miles_used: number | null
          notes: string | null
          payment_method: string
          sale_date: string | null
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          anticipation_date?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          gross_profit?: number | null
          has_anticipation?: boolean | null
          id?: string
          installments?: number | null
          miles_cost?: number | null
          miles_used?: number | null
          notes?: string | null
          payment_method: string
          sale_date?: string | null
          supplier_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          anticipation_date?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          gross_profit?: number | null
          has_anticipation?: boolean | null
          id?: string
          installments?: number | null
          miles_cost?: number | null
          miles_used?: number | null
          notes?: string | null
          payment_method?: string
          sale_date?: string | null
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          account_type: string
          contact: string
          created_at: string
          id: string
          last_used: string | null
          name: string
          notes: string | null
          program: string
          status: string
          updated_at: string
        }
        Insert: {
          account_type: string
          contact: string
          created_at?: string
          id?: string
          last_used?: string | null
          name: string
          notes?: string | null
          program: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          contact?: string
          created_at?: string
          id?: string
          last_used?: string | null
          name?: string
          notes?: string | null
          program?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string
          id: string
          subcategory: string | null
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          subcategory?: string | null
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          subcategory?: string | null
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "administrador" | "vendedor"
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
      user_role: ["administrador", "vendedor"],
    },
  },
} as const
