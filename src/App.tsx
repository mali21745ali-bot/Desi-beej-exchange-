/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SeedProvider, useSeeds } from './context/SeedContext';
import { ChatProvider, useChat } from './context/ChatContext';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SeedDetailModal } from './components/SeedDetailModal';
import { SeedFormModal } from './components/SeedFormModal';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminPanel } from './components/AdminPanel';

import { HomeView } from './views/HomeView';
import { ExchangeView } from './views/ExchangeView';
import { MarketView } from './views/MarketView';
import { MessagesView } from './views/MessagesView';
import { CropInfoView } from './views/CropInfoView';
import { AccountView } from './views/AccountView';

import { SeedItem, SeedType } from './types';

const MainAppContent: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const { seeds } = useSeeds();
  const { openChatWithUser } = useChat();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedSeedForDetail, setSelectedSeedForDetail] = useState<SeedItem | null>(null);

  // Form modal state
  const [seedFormModalOpen, setSeedFormModalOpen] = useState(false);
  const [seedFormType, setSeedFormType] = useState<SeedType>('exchange');
  const [editingSeed, setEditingSeed] = useState<SeedItem | null>(null);

  // Auth and notification modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  const handleOpenExchangeModal = () => {
    if (!userProfile) {
      setAuthModalOpen(true);
      return;
    }
    setEditingSeed(null);
    setSeedFormType('exchange');
    setSeedFormModalOpen(true);
  };

  const handleOpenSaleModal = () => {
    if (!userProfile) {
      setAuthModalOpen(true);
      return;
    }
    setEditingSeed(null);
    setSeedFormType('sale');
    setSeedFormModalOpen(true);
  };

  const handleEditSeed = (seed: SeedItem) => {
    setSelectedSeedForDetail(null);
    setEditingSeed(seed);
    setSeedFormType(seed.type);
    setSeedFormModalOpen(true);
  };

  const handleOpenChatWithSeedOwner = async (seed: SeedItem) => {
    setSelectedSeedForDetail(null);
    await openChatWithUser(
      seed.ownerId,
      seed.ownerName,
      seed.ownerPhone,
      seed.id,
      seed.title
    );
    setActiveTab('messages');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between font-urdu text-stone-900 pb-16 lg:pb-0" dir="rtl">
      {/* Top Navbar */}
      <Navbar
        onOpenExchangeModal={handleOpenExchangeModal}
        onOpenSaleModal={handleOpenSaleModal}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'home' && (
          <HomeView
            seeds={seeds}
            onSelectSeed={(seed) => setSelectedSeedForDetail(seed)}
            onOpenChat={handleOpenChatWithSeedOwner}
            onOpenExchangeModal={handleOpenExchangeModal}
            onOpenSaleModal={handleOpenSaleModal}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'exchange' && (
          <ExchangeView
            seeds={seeds}
            onSelectSeed={(seed) => setSelectedSeedForDetail(seed)}
            onOpenChat={handleOpenChatWithSeedOwner}
            onOpenExchangeModal={handleOpenExchangeModal}
          />
        )}

        {activeTab === 'market' && (
          <MarketView
            seeds={seeds}
            onSelectSeed={(seed) => setSelectedSeedForDetail(seed)}
            onOpenChat={handleOpenChatWithSeedOwner}
            onOpenSaleModal={handleOpenSaleModal}
          />
        )}

        {activeTab === 'messages' && <MessagesView />}

        {activeTab === 'crops' && <CropInfoView />}

        {activeTab === 'account' && (
          <AccountView
            onOpenExchangeModal={handleOpenExchangeModal}
            onOpenSaleModal={handleOpenSaleModal}
            onEditSeed={handleEditSeed}
            onSelectSeed={(seed) => setSelectedSeedForDetail(seed)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            onBackToApp={() => setActiveTab('home')}
            onSelectSeed={(seed) => setSelectedSeedForDetail(seed)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 py-8 px-4 text-center text-xs space-y-2 hidden lg:block">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-bold text-sm text-white font-urdu">
            دیسی بیج ایکسچینج (Desi Beej Exchange) - پاکستان
          </p>
          <p className="text-emerald-300/80 leading-relaxed max-w-2xl mx-auto">
            پاکستان کے کسانوں، باغبانوں اور بیجوں کے محافظین کے لیے وقف پلیٹ فارم۔ دیسی بیج ہماری زمین کا اثاثہ ہیں، انہیں اگلی نسلوں تک محفوظ رکھیں۔
          </p>
          <p className="text-[11px] text-emerald-400/60 font-sans">
            © {new Date().getFullYear()} Desi Beej Exchange Pakistan. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Seed Detail Modal */}
      {selectedSeedForDetail && (
        <SeedDetailModal
          seed={selectedSeedForDetail}
          onClose={() => setSelectedSeedForDetail(null)}
          onOpenChat={handleOpenChatWithSeedOwner}
          onEdit={handleEditSeed}
        />
      )}

      {/* Seed Create / Edit Modal */}
      {seedFormModalOpen && (
        <SeedFormModal
          initialData={editingSeed}
          defaultType={seedFormType}
          onClose={() => {
            setSeedFormModalOpen(false);
            setEditingSeed(null);
          }}
          onSuccess={(seedId) => {
            setSeedFormModalOpen(false);
            setEditingSeed(null);
          }}
        />
      )}

      {/* Authentication Modal */}
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}

      {/* Notifications Modal */}
      {notificationsModalOpen && (
        <NotificationsModal
          onClose={() => setNotificationsModalOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SeedProvider>
        <ChatProvider>
          <MainAppContent />
        </ChatProvider>
      </SeedProvider>
    </AuthProvider>
  );
}
