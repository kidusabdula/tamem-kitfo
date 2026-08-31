/**
 * Database types for the Tamem Kitfo schema.
 *
 * Hand-authored to match supabase/migrations/0001_init.sql. Once the project
 * is linked, `pnpm db:types` regenerates this file from the live database and
 * any drift between the migration and this file becomes a type error.
 */

export type FulfilmentType = 'dine_in' | 'pickup' | 'delivery'
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'completed' | 'cancelled'
export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
export type BookingStatus = 'new' | 'confirmed' | 'seated' | 'completed' | 'cancelled'
export type StaffRole = 'owner' | 'manager' | 'staff'
export type GalleryCategory = 'food' | 'dining' | 'events' | 'drinks'
export type EventType = 'wedding' | 'mahiber' | 'corporate' | 'birthday' | 'memorial' | 'other'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

/** Opening hours: weekday key -> [open, close] in 24h "HH:mm". */
export type OpeningHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', [string, string] | null>
>

export interface Database {
  public: {
    Tables: {
      staff_profiles: {
        Row: { id: string; full_name: string; role: StaffRole; created_at: string }
        Insert: { id: string; full_name: string; role?: StaffRole }
        Update: { full_name?: string; role?: StaffRole }
        Relationships: []
      }
      menu_categories: {
        Row: {
          id: string
          slug: string
          name_en: string
          name_am: string | null
          sort_order: number
          created_at: string
        }
        Insert: { slug: string; name_en: string; name_am?: string | null; sort_order?: number }
        Update: { slug?: string; name_en?: string; name_am?: string | null; sort_order?: number }
        Relationships: []
      }
      dishes: {
        Row: {
          id: string
          category_id: string | null
          slug: string
          name_en: string
          name_am: string | null
          description_en: string | null
          description_am: string | null
          price_etb: number
          image_path: string | null
          spice_level: number
          tags: string[]
          is_popular: boolean
          is_available: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          slug: string
          name_en: string
          name_am?: string | null
          description_en?: string | null
          description_am?: string | null
          price_etb: number
          image_path?: string | null
          spice_level?: number
          tags?: string[]
          is_popular?: boolean
          is_available?: boolean
          sort_order?: number
        }
        Update: Partial<Database['public']['Tables']['dishes']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'dishes_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'menu_categories'
            referencedColumns: ['id']
          },
        ]
      }
      gallery_images: {
        Row: {
          id: string
          storage_path: string
          alt_en: string
          alt_am: string | null
          category: GalleryCategory
          sort_order: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          storage_path: string
          alt_en: string
          alt_am?: string | null
          category?: GalleryCategory
          sort_order?: number
          is_published?: boolean
        }
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
        Relationships: []
      }
      site_content: {
        Row: { key: string; value_en: string | null; value_am: string | null; updated_at: string }
        Insert: { key: string; value_en?: string | null; value_am?: string | null }
        Update: { value_en?: string | null; value_am?: string | null }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: boolean
          phones: string[]
          whatsapp_number: string | null
          email: string | null
          address_en: string | null
          address_am: string | null
          map_url: string | null
          hours: OpeningHours
          socials: Record<string, string>
          is_accepting_orders: boolean
          delivery_note_en: string | null
          delivery_note_am: string | null
          updated_at: string
        }
        Insert: Partial<Omit<Database['public']['Tables']['site_settings']['Row'], 'updated_at'>>
        Update: Partial<Omit<Database['public']['Tables']['site_settings']['Row'], 'id' | 'updated_at'>>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          code: string
          customer_name: string
          customer_phone: string
          fulfilment_type: FulfilmentType
          scheduled_for: string | null
          delivery_address: string | null
          notes: string | null
          subtotal_etb: number
          status: OrderStatus
          telegram_message_id: number | null
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          customer_name: string
          customer_phone: string
          fulfilment_type: FulfilmentType
          scheduled_for?: string | null
          delivery_address?: string | null
          notes?: string | null
          subtotal_etb: number
          status?: OrderStatus
          telegram_message_id?: number | null
          locale?: string
        }
        Update: { status?: OrderStatus; telegram_message_id?: number | null; notes?: string | null }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          dish_id: string | null
          dish_name_snapshot: string
          unit_price_snapshot: number
          quantity: number
        }
        Insert: {
          order_id: string
          dish_id?: string | null
          dish_name_snapshot: string
          unit_price_snapshot: number
          quantity: number
        }
        Update: never
        // Declared so postgrest can resolve `orders(*, order_items(*))`.
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_dish_id_fkey'
            columns: ['dish_id']
            isOneToOne: false
            referencedRelation: 'dishes'
            referencedColumns: ['id']
          },
        ]
      }
      catering_inquiries: {
        Row: {
          id: string
          code: string
          name: string
          phone: string
          email: string | null
          event_type: EventType
          event_date: string | null
          guest_count: number | null
          location: string | null
          message: string | null
          status: InquiryStatus
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          name: string
          phone: string
          email?: string | null
          event_type?: EventType
          event_date?: string | null
          guest_count?: number | null
          location?: string | null
          message?: string | null
          locale?: string
        }
        Update: { status?: InquiryStatus }
        Relationships: []
      }
      table_bookings: {
        Row: {
          id: string
          code: string
          name: string
          phone: string
          party_size: number
          booking_at: string
          notes: string | null
          status: BookingStatus
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          name: string
          phone: string
          party_size: number
          booking_at: string
          notes?: string | null
          locale?: string
        }
        Update: { status?: BookingStatus }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: { name: string; phone?: string | null; email?: string | null; message: string }
        Update: { is_read?: boolean }
        Relationships: []
      }
      submission_log: {
        Row: { id: number; ip_hash: string; kind: string; created_at: string }
        Insert: { ip_hash: string; kind: string }
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean }
      is_owner: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      fulfilment_type: FulfilmentType
      order_status: OrderStatus
      inquiry_status: InquiryStatus
      booking_status: BookingStatus
      staff_role: StaffRole
      gallery_category: GalleryCategory
      event_type: EventType
    }
    CompositeTypes: Record<string, never>
  }
}

/* Convenience row aliases used throughout the app. */
type T = Database['public']['Tables']
export type Dish = T['dishes']['Row']
export type MenuCategory = T['menu_categories']['Row']
export type GalleryImage = T['gallery_images']['Row']
export type SiteSettings = T['site_settings']['Row']
export type SiteContent = T['site_content']['Row']
export type Order = T['orders']['Row']
export type OrderItem = T['order_items']['Row']
export type CateringInquiry = T['catering_inquiries']['Row']
export type TableBooking = T['table_bookings']['Row']
export type ContactMessage = T['contact_messages']['Row']
export type StaffProfile = T['staff_profiles']['Row']

export type OrderWithItems = Order & { order_items: OrderItem[] }
export type DishWithCategory = Dish & { menu_categories: Pick<MenuCategory, 'slug' | 'name_en' | 'name_am'> | null }
