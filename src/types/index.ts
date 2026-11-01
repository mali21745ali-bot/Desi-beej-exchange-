export type SeedType = 'exchange' | 'sale';

export type SeedStatus = 'active' | 'exchanged' | 'sold' | 'archived';

export type UserRole = 'farmer' | 'grower' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  city: string;
  province?: string;
  photoUrl?: string;
  bio?: string;
  role: UserRole;
  isSuspended?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeedItem {
  id: string;
  title: string;
  type: SeedType; // exchange or sale
  category: string;
  price?: number; // In PKR, 0 if exchange
  quantity: string;
  unit: string; // کلو، من، گرام، پیکٹ، بوری
  city: string;
  location?: string;
  description: string;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp?: string;
  status: SeedStatus;
  exchangeFor?: string; // If exchange: What seed is desired in return
  harvestYear?: string;
  germinationRate?: string;
  isOrganic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationItem {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantPhones?: Record<string, string>;
  participantPhotos?: Record<string, string>;
  lastMessageText: string;
  lastMessageTime: string;
  seedId?: string;
  seedTitle?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: Record<string, number>;
}

export type MessageType = 'text' | 'voice' | 'image';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  mediaUrl?: string; // Base64 audio/image or URL
  durationSeconds?: number; // For voice notes
  createdAt: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'seed' | 'user';
  targetId: string;
  targetTitle: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface CropGuideItem {
  id: string;
  cropUrdu: string;
  cropEng: string;
  category: string;
  season: string; // ربیع / خریف
  sowingPeriod: string;
  seedRate: string;
  irrigation: string;
  fertilizer: string;
  pestsAndDiseases: string;
  harvesting: string;
  desiVarieties: string;
  iconName?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'message' | 'exchange' | 'system' | 'alert';
  read: boolean;
}
