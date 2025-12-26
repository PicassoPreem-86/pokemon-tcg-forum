// Bulbagarden-style Forum Types

// Forum within a category (like XenForo nodes)
export interface Forum {
  id: string;
  slug: string;
  name: string;
  description: string;
  threadCount: number;
  postCount: number;
  latestThread?: {
    title: string;
    author: string;
    date: string;
    authorAvatar?: string;
  };
  subforums?: string[];
}

// Category section containing multiple forums
export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isSection?: boolean;
  forums?: Forum[];
  // Legacy support
  threadCount?: number;
  postCount?: number;
  subcategories?: Subcategory[];
  lastActivity?: ThreadActivity;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// User Types
export type UserRole = 'member' | 'moderator' | 'admin' | 'vip' | 'newbie';

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: UserRole;
  joinDate: string;
  postCount: number;
  reputation?: number;
  location?: string;
  signature?: string;
  bio?: string;
  isOnline?: boolean;
  badges?: UserBadge[];
}

// Thread Types
export interface Thread {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  forumId?: string;
  subcategoryId?: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  viewCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  isHot?: boolean;
  tags?: string[];
  lastReply?: {
    userId: string;
    username: string;
    avatar?: string;
    timestamp: string;
  };
  excerpt?: string;
}

// Post Types
export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
  postNumber: number;
  quotedPostId?: string;
  isEdited?: boolean;
  reactions?: PostReaction[];
}

export interface PostReaction {
  type: 'like' | 'helpful' | 'fire';
  count: number;
  userIds: string[];
}

// Activity Types
export interface ThreadActivity {
  threadId: string;
  threadTitle: string;
  threadSlug: string;
  categoryId: string;
  userId: string;
  username: string;
  avatar?: string;
  timestamp: string;
}

// Statistics Types
export interface ForumStatistics {
  totalThreads: number;
  totalPosts: number;
  totalMembers: number;
  onlineUsers: number;
  newestMember: {
    id: string;
    username: string;
    joinDate: string;
  };
  todayStats?: {
    newThreads: number;
    newPosts: number;
    newMembers: number;
  };
}

// Pagination Types
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Search Types
export interface SearchFilters {
  query: string;
  category?: string;
  author?: string;
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'relevance' | 'date' | 'replies';
}

export interface SearchResult {
  type: 'thread' | 'post' | 'user';
  thread?: Thread;
  post?: ForumPost;
  user?: User;
  highlight?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  isSelected?: boolean;
  children?: NavItem[];
}

// Site Config Types
export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  twitter: string;
  itemsPerPage: number;
}

// Sidebar Widget Types
export interface SidebarLink {
  name: string;
  href: string;
  icon?: string;
}

// Poll Types
export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  voterIds: string[];
}

export interface Poll {
  id: string;
  threadId: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  expiresAt?: string;
  isExpired?: boolean;
  // Settings
  allowMultipleVotes: boolean;
  allowVoteChange: boolean;
  showResultsBeforeVote: boolean;
  isAnonymous: boolean;
  // Stats
  totalVotes: number;
  voterCount: number;
}

export interface PollVote {
  userId: string;
  optionIds: string[];
  votedAt: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
  expiresAt?: string;
  allowMultipleVotes?: boolean;
  allowVoteChange?: boolean;
  showResultsBeforeVote?: boolean;
  isAnonymous?: boolean;
}
