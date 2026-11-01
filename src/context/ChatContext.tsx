import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from '../firebase';
import { ConversationItem, ChatMessage, MessageType } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: ConversationItem[];
  activeConversation: ConversationItem | null;
  activeMessages: ChatMessage[];
  loadingMessages: boolean;
  unreadTotal: number;
  openChatWithUser: (recipientId: string, recipientName: string, recipientPhone?: string, seedId?: string, seedTitle?: string) => Promise<string>;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (type: MessageType, text?: string, mediaUrl?: string, durationSeconds?: number) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Initial sample messages to show realistic chat experience
const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-sample-1',
    participantIds: ['guest-user', 'farmer-ahmad-01'],
    participantNames: {
      'guest-user': 'کسان بھائی',
      'farmer-ahmad-01': 'چوہدری احمد علی رندھاوا'
    },
    participantPhones: {
      'farmer-ahmad-01': '03007654321'
    },
    lastMessageText: 'وعلیکم السلام، جی بھائی لال گندم کا خالص بیج موجود ہے۔ آپ کس بیج سے تبادلہ کرنا چاہتے ہیں؟',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    seedId: 'seed-1',
    seedTitle: 'دیسی لال گندم (خالص روایتی بیج - C-591)',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-sample-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-sample-1',
      senderId: 'guest-user',
      senderName: 'کسان بھائی',
      type: 'text',
      text: 'السلام علیکم چوہدری صاحب! آپ کا دیسی لال گندم کا اشتہار دیکھا۔ کیا یہ دستیاب ہے؟',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'msg-2',
      conversationId: 'conv-sample-1',
      senderId: 'farmer-ahmad-01',
      senderName: 'چوہدری احمد علی رندھاوا',
      type: 'text',
      text: 'وعلیکم السلام، جی بھائی لال گندم کا خالص بیج موجود ہے۔ آپ کس بیج سے تبادلہ کرنا چاہتے ہیں؟',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, currentUser, blockedUserIds } = useAuth();
  const currentUserId = currentUser?.uid || userProfile?.id || 'guest-user';
  
  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    const saved = localStorage.getItem('desi_beej_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_CONVERSATIONS; }
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Firestore listener for conversations
  useEffect(() => {
    if (!currentUserId) return;
    
    try {
      const convsRef = collection(db, 'conversations');
      const unsubscribe = onSnapshot(convsRef, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ConversationItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Omit<ConversationItem, 'id'>;
            // Check if current user is participant
            if (data.participantIds?.includes(currentUserId)) {
              loaded.push({ id: docSnap.id, ...data });
            }
          });

          if (loaded.length > 0) {
            setConversations(loaded);
            localStorage.setItem('desi_beej_conversations', JSON.stringify(loaded));
          }
        }
      }, (err) => {
        console.warn('Conversations snapshot warning (using local):', err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Chat listener setup error:', e);
    }
  }, [currentUserId]);

  // Firestore listener for messages in active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setActiveMessages([]);
      return;
    }

    setLoadingMessages(true);
    
    // Check local fallback first
    const localStoreKey = `desi_beej_messages_${activeConversationId}`;
    const cached = localStorage.getItem(localStoreKey);
    if (cached) {
      try {
        setActiveMessages(JSON.parse(cached));
      } catch (e) {
        // Continue
      }
    } else if (INITIAL_MESSAGES[activeConversationId]) {
      setActiveMessages(INITIAL_MESSAGES[activeConversationId]);
    }

    try {
      const messagesRef = collection(db, 'conversations', activeConversationId, 'messages');
      const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        if (!snapshot.empty) {
          const msgs: ChatMessage[] = [];
          snapshot.forEach((d) => {
            msgs.push({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) });
          });
          // Sort chronologically
          msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setActiveMessages(msgs);
          localStorage.setItem(localStoreKey, JSON.stringify(msgs));
        }
        setLoadingMessages(false);
      }, (err) => {
        console.warn('Messages snapshot warning:', err.message);
        setLoadingMessages(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Messages query error:', e);
      setLoadingMessages(false);
    }
  }, [activeConversationId]);

  const openChatWithUser = async (
    recipientId: string, 
    recipientName: string, 
    recipientPhone?: string,
    seedId?: string, 
    seedTitle?: string
  ): Promise<string> => {
    const myId = currentUserId;
    const myName = userProfile?.name || 'کسان بھائی';

    // Find existing conversation between these two users
    let existing = conversations.find(
      (c) => c.participantIds.includes(myId) && c.participantIds.includes(recipientId)
    );

    if (existing) {
      setActiveConversationIdState(existing.id);
      return existing.id;
    }

    // Create new conversation
    const newConvId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newConversation: ConversationItem = {
      id: newConvId,
      participantIds: [myId, recipientId],
      participantNames: {
        [myId]: myName,
        [recipientId]: recipientName
      },
      participantPhones: {
        [myId]: userProfile?.phone || '',
        [recipientId]: recipientPhone || ''
      },
      lastMessageText: seedTitle ? `بیج کے بارے میں: ${seedTitle}` : 'بات چیت کا آغاز ہوا',
      lastMessageTime: now,
      seedId,
      seedTitle,
      createdAt: now,
      updatedAt: now
    };

    setConversations((prev) => {
      const updated = [newConversation, ...prev];
      localStorage.setItem('desi_beej_conversations', JSON.stringify(updated));
      return updated;
    });

    setActiveConversationIdState(newConvId);

    // Sync to Firestore
    try {
      const convRef = doc(db, 'conversations', newConvId);
      await setDoc(convRef, newConversation);
    } catch (err) {
      console.warn('Failed to save conversation to Firestore:', err);
    }

    return newConvId;
  };

  const sendMessage = async (
    type: MessageType, 
    text?: string, 
    mediaUrl?: string, 
    durationSeconds?: number
  ) => {
    if (!activeConversationId) return;

    const myId = currentUserId;
    const myName = userProfile?.name || 'کسان بھائی';
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newMsg: ChatMessage = {
      id: msgId,
      conversationId: activeConversationId,
      senderId: myId,
      senderName: myName,
      type,
      text: text || '',
      mediaUrl: mediaUrl || '',
      durationSeconds: durationSeconds || 0,
      createdAt: now
    };

    // Update messages locally
    setActiveMessages((prev) => {
      const updated = [...prev, newMsg];
      localStorage.setItem(`desi_beej_messages_${activeConversationId}`, JSON.stringify(updated));
      return updated;
    });

    // Update conversation last message
    const summaryText = type === 'voice' 
      ? `🎤 صوتی پیغام (${Math.round(durationSeconds || 0)} سیکنڈ)`
      : type === 'image' 
      ? '📷 تصویر' 
      : (text || '');

    setConversations((prev) => {
      const updated = prev.map((c) => 
        c.id === activeConversationId 
          ? { ...c, lastMessageText: summaryText, lastMessageTime: now, updatedAt: now } 
          : c
      );
      localStorage.setItem('desi_beej_conversations', JSON.stringify(updated));
      return updated;
    });

    // Write message to Firestore subcollection
    try {
      const messageDocRef = doc(db, 'conversations', activeConversationId, 'messages', msgId);
      await setDoc(messageDocRef, newMsg);

      const convDocRef = doc(db, 'conversations', activeConversationId);
      await updateDoc(convDocRef, {
        lastMessageText: summaryText,
        lastMessageTime: now,
        updatedAt: now
      });
    } catch (err) {
      console.warn('Firestore message save error:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeConversationId) return;

    setActiveMessages((prev) => {
      const updated = prev.filter((m) => m.id !== messageId);
      localStorage.setItem(`desi_beej_messages_${activeConversationId}`, JSON.stringify(updated));
      return updated;
    });

    try {
      const messageDocRef = doc(db, 'conversations', activeConversationId, 'messages', messageId);
      await deleteDoc(messageDocRef);
    } catch (err) {
      console.warn('Error deleting message from Firestore:', err);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Filter out conversations with blocked users
  const visibleConversations = conversations.filter(conv => {
    return !conv.participantIds.some(id => id !== currentUserId && blockedUserIds.includes(id));
  });

  return (
    <ChatContext.Provider
      value={{
        conversations: visibleConversations,
        activeConversation,
        activeMessages,
        loadingMessages,
        unreadTotal: visibleConversations.length > 0 ? 1 : 0,
        openChatWithUser,
        setActiveConversationId: setActiveConversationIdState,
        sendMessage,
        deleteMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
