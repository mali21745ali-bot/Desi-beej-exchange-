import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  handleFirestoreError,
  OperationType 
} from '../firebase';
import { SeedItem, SafetyReport } from '../types';
import { INITIAL_SEEDS } from '../data/initialSeeds';
import { useAuth } from './AuthContext';

interface SeedContextType {
  seeds: SeedItem[];
  loading: boolean;
  addSeed: (seedData: Omit<SeedItem, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName' | 'ownerPhone'>) => Promise<string>;
  updateSeed: (id: string, updates: Partial<SeedItem>) => Promise<void>;
  deleteSeed: (id: string) => Promise<void>;
  reportItem: (targetType: 'seed' | 'user', targetId: string, targetTitle: string, reason: string, details?: string) => Promise<void>;
  reports: SafetyReport[];
  resolveReport: (reportId: string, status: 'resolved' | 'dismissed') => Promise<void>;
}

const SeedContext = createContext<SeedContextType | undefined>(undefined);

export const SeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, currentUser, isAdmin, blockedUserIds } = useAuth();
  const [seeds, setSeeds] = useState<SeedItem[]>(() => {
    const saved = localStorage.getItem('desi_beej_cached_seeds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_SEEDS;
  });
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<SafetyReport[]>(() => {
    const saved = localStorage.getItem('desi_beej_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Real-time Firestore sync for seeds
  useEffect(() => {
    const seedsRef = collection(db, 'seeds');
    
    // Subscribe to snapshot
    const unsubscribe = onSnapshot(seedsRef, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreSeeds: SeedItem[] = [];
        snapshot.forEach((docSnap) => {
          firestoreSeeds.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<SeedItem, 'id'>)
          });
        });
        
        // Merge or replace
        setSeeds((prev) => {
          // Keep existing initial seeds that are not duplicated
          const firestoreIds = new Set(firestoreSeeds.map(s => s.id));
          const remainingInitial = INITIAL_SEEDS.filter(s => !firestoreIds.has(s.id));
          const merged = [...firestoreSeeds, ...remainingInitial];
          localStorage.setItem('desi_beej_cached_seeds', JSON.stringify(merged));
          return merged;
        });
      } else {
        // If Firestore seeds collection is completely empty, keep initial seeds
        localStorage.setItem('desi_beej_cached_seeds', JSON.stringify(INITIAL_SEEDS));
      }
      setLoading(false);
    }, (error) => {
      console.warn('Seeds onSnapshot error (using cached seed data):', error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to reports if admin
  useEffect(() => {
    if (!isAdmin) return;
    const reportsRef = collection(db, 'reports');
    const unsubscribe = onSnapshot(reportsRef, (snapshot) => {
      const list: SafetyReport[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<SafetyReport, 'id'>) });
      });
      if (list.length > 0) {
        setReports(list);
        localStorage.setItem('desi_beej_reports', JSON.stringify(list));
      }
    }, (err) => {
      console.warn('Reports onSnapshot error:', err.message);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const addSeed = async (seedData: Omit<SeedItem, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName' | 'ownerPhone'>): Promise<string> => {
    if (!userProfile) {
      throw new Error('براہ کرم اشتہار لگانے کے لیے پہلے لاگ ان کریں۔');
    }

    const newId = `seed-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    const newSeed: SeedItem = {
      ...seedData,
      id: newId,
      ownerId: currentUser?.uid || userProfile.id,
      ownerName: userProfile.name,
      ownerPhone: userProfile.phone,
      ownerWhatsapp: userProfile.whatsapp || userProfile.phone,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    };

    // Update local state first for instant responsiveness
    setSeeds((prev) => {
      const updated = [newSeed, ...prev];
      localStorage.setItem('desi_beej_cached_seeds', JSON.stringify(updated));
      return updated;
    });

    // Sync to Firestore
    try {
      const seedDocRef = doc(db, 'seeds', newId);
      await setDoc(seedDocRef, newSeed);
    } catch (error) {
      console.warn('Firestore write warning (persisted locally):', error);
    }

    return newId;
  };

  const updateSeed = async (id: string, updates: Partial<SeedItem>) => {
    const now = new Date().toISOString();
    
    setSeeds((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s));
      localStorage.setItem('desi_beej_cached_seeds', JSON.stringify(updated));
      return updated;
    });

    try {
      const seedDocRef = doc(db, 'seeds', id);
      await updateDoc(seedDocRef, { ...updates, updatedAt: now });
    } catch (error) {
      console.warn('Firestore update warning:', error);
    }
  };

  const deleteSeed = async (id: string) => {
    setSeeds((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('desi_beej_cached_seeds', JSON.stringify(updated));
      return updated;
    });

    try {
      const seedDocRef = doc(db, 'seeds', id);
      await deleteDoc(seedDocRef);
    } catch (error) {
      console.warn('Firestore delete warning:', error);
    }
  };

  const reportItem = async (
    targetType: 'seed' | 'user',
    targetId: string,
    targetTitle: string,
    reason: string,
    details?: string
  ) => {
    const reportId = `report-${Date.now()}`;
    const report: SafetyReport = {
      id: reportId,
      reporterId: userProfile?.id || 'guest',
      reporterName: userProfile?.name || 'نامعلوم کسان',
      targetType,
      targetId,
      targetTitle,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setReports((prev) => {
      const updated = [report, ...prev];
      localStorage.setItem('desi_beej_reports', JSON.stringify(updated));
      return updated;
    });

    try {
      const reportRef = doc(db, 'reports', reportId);
      await setDoc(reportRef, report);
    } catch (e) {
      console.warn('Report write error:', e);
    }
  };

  const resolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setReports((prev) => {
      const updated = prev.map((r) => (r.id === reportId ? { ...r, status } : r));
      localStorage.setItem('desi_beej_reports', JSON.stringify(updated));
      return updated;
    });

    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { status });
    } catch (e) {
      console.warn('Update report status error:', e);
    }
  };

  // Filter out listings from blocked users
  const visibleSeeds = seeds.filter(seed => !blockedUserIds.includes(seed.ownerId));

  return (
    <SeedContext.Provider
      value={{
        seeds: visibleSeeds,
        loading,
        addSeed,
        updateSeed,
        deleteSeed,
        reportItem,
        reports,
        resolveReport
      }}
    >
      {children}
    </SeedContext.Provider>
  );
};

export const useSeeds = () => {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error('useSeeds must be used within a SeedProvider');
  }
  return context;
};
