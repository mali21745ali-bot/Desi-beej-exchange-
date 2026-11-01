import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  handleFirestoreError,
  OperationType,
  type FirebaseUser
} from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  quickFarmerLogin: (name: string, phone: string, city: string, whatsapp?: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  blockedUserIds: string[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'mali21745ali@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('desi_beej_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('desi_beej_blocked_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const isAdmin = Boolean(
    (currentUser && currentUser.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    (userProfile && userProfile.role === 'admin') ||
    (userProfile && userProfile.email && userProfile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  );

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile(data);
            localStorage.setItem('desi_beej_user_profile', JSON.stringify(data));
          } else {
            // First time Google user: create initial profile
            const isUserAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            const newProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || 'کسان بھائی',
              email: user.email || undefined,
              phone: user.phoneNumber || '',
              whatsapp: user.phoneNumber || '',
              city: 'فیصل آباد',
              province: 'پنجاب',
              photoUrl: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              role: isUserAdmin ? 'admin' : 'farmer',
              isSuspended: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            localStorage.setItem('desi_beej_user_profile', JSON.stringify(newProfile));
          }
        } catch (err) {
          console.warn('Error fetching user profile from Firestore:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Quick Farmer Login (especially suitable for low bandwidth / rural farmers who prefer mobile registration)
  const quickFarmerLogin = async (name: string, phone: string, city: string, whatsapp?: string) => {
    try {
      setLoading(true);
      const generatedId = `farmer-${phone.replace(/[^0-9]/g, '').slice(-7) || Math.random().toString(36).substring(2, 9)}`;
      const isUserAdmin = phone === '03000000000'; // Admin backdoor for testing or matching admin
      
      const newProfile: UserProfile = {
        id: generatedId,
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp || phone).trim(),
        city: city.trim(),
        province: 'پاکستان',
        photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=15803d`,
        role: isUserAdmin ? 'admin' : 'farmer',
        isSuspended: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try persisting to Firestore if auth allows, or keep in local profile
      try {
        const userDocRef = doc(db, 'users', generatedId);
        await setDoc(userDocRef, newProfile);
      } catch (err) {
        console.info('Quick login persisted locally:', err);
      }

      setUserProfile(newProfile);
      localStorage.setItem('desi_beej_user_profile', JSON.stringify(newProfile));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString()
    };

    try {
      if (currentUser?.uid) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Could not update profile in Firestore:', error);
    }

    setUserProfile(updated);
    localStorage.setItem('desi_beej_user_profile', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      if (currentUser) {
        await signOut(auth);
      }
      setUserProfile(null);
      localStorage.removeItem('desi_beej_user_profile');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const blockUser = (userId: string) => {
    if (!blockedUserIds.includes(userId)) {
      const updated = [...blockedUserIds, userId];
      setBlockedUserIds(updated);
      localStorage.setItem('desi_beej_blocked_users', JSON.stringify(updated));
    }
  };

  const unblockUser = (userId: string) => {
    const updated = blockedUserIds.filter(id => id !== userId);
    setBlockedUserIds(updated);
    localStorage.setItem('desi_beej_blocked_users', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        signInWithGoogle,
        quickFarmerLogin,
        updateProfile,
        logout,
        blockedUserIds,
        blockUser,
        unblockUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
