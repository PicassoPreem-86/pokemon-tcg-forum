import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Notification Settings
  emailThreadReplies: boolean;
  emailMentions: boolean;
  emailDirectMessages: boolean;
  emailWeeklyDigest: boolean;
  emailNewsUpdates: boolean;
  pushNotifications: boolean;
  notificationSound: boolean;

  // Privacy Settings
  profileVisibility: 'public' | 'members' | 'private';
  showOnlineStatus: boolean;
  showEmail: boolean;
  showLocation: boolean;
  showActivityFeed: boolean;
  allowDirectMessages: 'everyone' | 'following' | 'nobody';

  // Appearance Settings
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  showAvatars: boolean;

  // Forum Preferences
  postsPerPage: number;
  defaultSort: 'newest' | 'oldest' | 'popular';

  // Trading Settings
  collectionVisibility: 'public' | 'members' | 'private';
  showWishlist: boolean;
  tradeStatus: 'active' | 'paused' | 'not-trading';
  tradeRegion: string;
  gradingPreference: 'psa' | 'bgs' | 'cgc' | 'sgc' | 'raw' | 'any';

  // Actions
  setEmailThreadReplies: (value: boolean) => void;
  setEmailMentions: (value: boolean) => void;
  setEmailDirectMessages: (value: boolean) => void;
  setEmailWeeklyDigest: (value: boolean) => void;
  setEmailNewsUpdates: (value: boolean) => void;
  setPushNotifications: (value: boolean) => void;
  setNotificationSound: (value: boolean) => void;

  setProfileVisibility: (value: 'public' | 'members' | 'private') => void;
  setShowOnlineStatus: (value: boolean) => void;
  setShowEmail: (value: boolean) => void;
  setShowLocation: (value: boolean) => void;
  setShowActivityFeed: (value: boolean) => void;
  setAllowDirectMessages: (value: 'everyone' | 'following' | 'nobody') => void;

  setTheme: (value: 'dark' | 'light' | 'system') => void;
  setAccentColor: (value: string) => void;
  setFontSize: (value: 'small' | 'medium' | 'large') => void;
  setCompactMode: (value: boolean) => void;
  setShowAvatars: (value: boolean) => void;

  setPostsPerPage: (value: number) => void;
  setDefaultSort: (value: 'newest' | 'oldest' | 'popular') => void;

  setCollectionVisibility: (value: 'public' | 'members' | 'private') => void;
  setShowWishlist: (value: boolean) => void;
  setTradeStatus: (value: 'active' | 'paused' | 'not-trading') => void;
  setTradeRegion: (value: string) => void;
  setGradingPreference: (value: 'psa' | 'bgs' | 'cgc' | 'sgc' | 'raw' | 'any') => void;

  // Bulk update
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  // Notification defaults
  emailThreadReplies: true,
  emailMentions: true,
  emailDirectMessages: true,
  emailWeeklyDigest: false,
  emailNewsUpdates: false,
  pushNotifications: true,
  notificationSound: true,

  // Privacy defaults
  profileVisibility: 'public' as const,
  showOnlineStatus: true,
  showEmail: false,
  showLocation: true,
  showActivityFeed: true,
  allowDirectMessages: 'everyone' as const,

  // Appearance defaults
  theme: 'dark' as const,
  accentColor: '#7c3aed',
  fontSize: 'medium' as const,
  compactMode: false,
  showAvatars: true,

  // Forum preferences defaults
  postsPerPage: 20,
  defaultSort: 'newest' as const,

  // Trading defaults
  collectionVisibility: 'public' as const,
  showWishlist: true,
  tradeStatus: 'active' as const,
  tradeRegion: 'United States',
  gradingPreference: 'any' as const,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      // Notification setters
      setEmailThreadReplies: (value) => set({ emailThreadReplies: value }),
      setEmailMentions: (value) => set({ emailMentions: value }),
      setEmailDirectMessages: (value) => set({ emailDirectMessages: value }),
      setEmailWeeklyDigest: (value) => set({ emailWeeklyDigest: value }),
      setEmailNewsUpdates: (value) => set({ emailNewsUpdates: value }),
      setPushNotifications: (value) => set({ pushNotifications: value }),
      setNotificationSound: (value) => set({ notificationSound: value }),

      // Privacy setters
      setProfileVisibility: (value) => set({ profileVisibility: value }),
      setShowOnlineStatus: (value) => set({ showOnlineStatus: value }),
      setShowEmail: (value) => set({ showEmail: value }),
      setShowLocation: (value) => set({ showLocation: value }),
      setShowActivityFeed: (value) => set({ showActivityFeed: value }),
      setAllowDirectMessages: (value) => set({ allowDirectMessages: value }),

      // Appearance setters
      setTheme: (value) => set({ theme: value }),
      setAccentColor: (value) => set({ accentColor: value }),
      setFontSize: (value) => set({ fontSize: value }),
      setCompactMode: (value) => set({ compactMode: value }),
      setShowAvatars: (value) => set({ showAvatars: value }),

      // Forum preferences setters
      setPostsPerPage: (value) => set({ postsPerPage: value }),
      setDefaultSort: (value) => set({ defaultSort: value }),

      // Trading setters
      setCollectionVisibility: (value) => set({ collectionVisibility: value }),
      setShowWishlist: (value) => set({ showWishlist: value }),
      setTradeStatus: (value) => set({ tradeStatus: value }),
      setTradeRegion: (value) => set({ tradeRegion: value }),
      setGradingPreference: (value) => set({ gradingPreference: value }),

      // Bulk update
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'tcg-forum-settings',
      partialize: (state) => ({
        emailThreadReplies: state.emailThreadReplies,
        emailMentions: state.emailMentions,
        emailDirectMessages: state.emailDirectMessages,
        emailWeeklyDigest: state.emailWeeklyDigest,
        emailNewsUpdates: state.emailNewsUpdates,
        pushNotifications: state.pushNotifications,
        notificationSound: state.notificationSound,
        profileVisibility: state.profileVisibility,
        showOnlineStatus: state.showOnlineStatus,
        showEmail: state.showEmail,
        showLocation: state.showLocation,
        showActivityFeed: state.showActivityFeed,
        allowDirectMessages: state.allowDirectMessages,
        theme: state.theme,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        compactMode: state.compactMode,
        showAvatars: state.showAvatars,
        postsPerPage: state.postsPerPage,
        defaultSort: state.defaultSort,
        collectionVisibility: state.collectionVisibility,
        showWishlist: state.showWishlist,
        tradeStatus: state.tradeStatus,
        tradeRegion: state.tradeRegion,
        gradingPreference: state.gradingPreference,
      }),
    }
  )
);
