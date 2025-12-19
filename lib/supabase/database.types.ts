export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'newbie' | 'member' | 'vip' | 'moderator' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          role: UserRole
          bio: string | null
          location: string | null
          signature: string | null
          post_count: number
          reputation: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          bio?: string | null
          location?: string | null
          signature?: string | null
          post_count?: number
          reputation?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          bio?: string | null
          location?: string | null
          signature?: string | null
          post_count?: number
          reputation?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          icon: string
          color: string
          sort_order: number
          thread_count: number
          post_count: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          icon?: string
          color?: string
          sort_order?: number
          thread_count?: number
          post_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          sort_order?: number
          thread_count?: number
          post_count?: number
          created_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          excerpt: string | null
          category_id: string
          author_id: string
          view_count: number
          post_count: number
          is_pinned: boolean
          is_locked: boolean
          is_hot: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          excerpt?: string | null
          category_id: string
          author_id: string
          view_count?: number
          post_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_hot?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          excerpt?: string | null
          category_id?: string
          author_id?: string
          view_count?: number
          post_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_hot?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      thread_tags: {
        Row: {
          id: string
          thread_id: string
          tag: string
        }
        Insert: {
          id?: string
          thread_id: string
          tag: string
        }
        Update: {
          id?: string
          thread_id?: string
          tag?: string
        }
      }
      replies: {
        Row: {
          id: string
          thread_id: string
          parent_reply_id: string | null
          author_id: string
          content: string
          like_count: number
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          parent_reply_id?: string | null
          author_id: string
          content: string
          like_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          parent_reply_id?: string | null
          author_id?: string
          content?: string
          like_count?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reply_images: {
        Row: {
          id: string
          reply_id: string
          url: string
          alt: string | null
          width: number | null
          height: number | null
          sort_order: number
        }
        Insert: {
          id?: string
          reply_id: string
          url: string
          alt?: string | null
          width?: number | null
          height?: number | null
          sort_order?: number
        }
        Update: {
          id?: string
          reply_id?: string
          url?: string
          alt?: string | null
          width?: number | null
          height?: number | null
          sort_order?: number
        }
      }
      reply_likes: {
        Row: {
          id: string
          reply_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          reply_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          reply_id?: string
          user_id?: string
          created_at?: string
        }
      }
      thread_likes: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          color: string
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          awarded_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          thread_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: 'reply' | 'mention' | 'like' | 'follow' | 'badge'
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: 'reply' | 'mention' | 'like' | 'follow' | 'badge'
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string | null
          type?: 'reply' | 'mention' | 'like' | 'follow' | 'badge'
          message?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: { thread_id: string }
        Returns: void
      }
      increment_post_count: {
        Args: { thread_id: string; category_id: string }
        Returns: void
      }
    }
    Enums: {
      user_role: UserRole
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Thread = Database['public']['Tables']['threads']['Row']
export type Reply = Database['public']['Tables']['replies']['Row']
export type ReplyImage = Database['public']['Tables']['reply_images']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']

// Thread with author profile
export type ThreadWithAuthor = Thread & {
  author: Profile
  category: Category
  tags: string[]
}

// Reply with author profile
export type ReplyWithAuthor = Reply & {
  author: Profile
  images: ReplyImage[]
  liked_by_user: boolean
}

// Bookmark type
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']

// Notification type
export type Notification = Database['public']['Tables']['notifications']['Row']

// Bookmark with thread details
export type BookmarkWithThread = Bookmark & {
  thread: ThreadWithAuthor
}

// Notification with actor profile
export type NotificationWithActor = Notification & {
  actor: Profile | null
}
