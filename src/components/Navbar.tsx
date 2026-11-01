import React from 'react';
import { 
  Sprout, 
  Repeat, 
  PlusCircle, 
  Bell, 
  User, 
  ShieldCheck, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

interface NavbarProps {
  onOpenExchangeModal: () => void;
  onOpenSaleModal: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExchangeModal,
  onOpenSaleModal,
  onNavigateTab,
  onOpenNotifications,
  onOpenAuthModal,
  activeTab,
}) => {
  const { userProfile, currentUser, isAdmin, logout } = useAuth();
  const { unreadTotal } = useChat();

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      {/* Pakistan Farmer Helpline Notice bar */}
      <div className="bg-emerald-950/90 text-emerald-200 text-[11px] py-1 px-4 text-center font-medium border-b border-emerald-800/50 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>پاکستان کا سب سے بڑا روایتی و دیسی بیج ایکسچینج پلیٹ فارم - براہ راست کسان سے کسان</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand Title */}
        <div 
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-1.5 font-urdu">
              <span>دیسی بیج ایکسچینج</span>
              <span className="text-[10px] bg-amber-400 text-emerald-950 px-1.5 py-0.5 rounded-sm font-sans font-bold">
                PK
              </span>
            </h1>
            <p className="text-[11px] text-emerald-300 font-sans -mt-1 hidden sm:block">
              Desi Beej Exchange
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Shortcuts */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onNavigateTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'home' ? 'bg-white/15 text-white' : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            ہوم
          </button>
          <button
            onClick={() => onNavigateTab('exchange')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'exchange' ? 'bg-white/15 text-white' : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            بیج کا تبادلہ
          </button>
          <button
            onClick={() => onNavigateTab('market')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'market' ? 'bg-white/15 text-white' : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            بیج برائے فروخت
          </button>
          <button
            onClick={() => onNavigateTab('messages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition relative ${
              activeTab === 'messages' ? 'bg-white/15 text-white' : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            پیغامات
            {unreadTotal > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1" />
            )}
          </button>
          <button
            onClick={() => onNavigateTab('crops')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'crops' ? 'bg-white/15 text-white' : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            فصلوں کی معلومات
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 ${
                activeTab === 'admin' ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ایڈمن پینل</span>
            </button>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Post Exchange Button */}
          <button
            onClick={onOpenExchangeModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Repeat className="w-3.5 h-3.5 text-emerald-200" />
            <span>بیج تبدیل کریں</span>
          </button>

          {/* Post Sale Button */}
          <button
            onClick={onOpenSaleModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black rounded-xl text-xs transition shadow-xs active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>بیج بیچیں</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition relative"
            title="اطلاعات (Notifications)"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
          </button>

          {/* User Account / Profile */}
          {userProfile ? (
            <button
              onClick={() => onNavigateTab('account')}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition border border-emerald-700"
              title="میرا اکاؤنٹ"
            >
              <img
                src={userProfile.photoUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={userProfile.name}
                className="w-8 h-8 rounded-lg object-cover bg-emerald-800"
              />
              <span className="text-xs font-bold hidden md:inline truncate max-w-[90px]">
                {userProfile.name}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-2 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition shadow-xs"
            >
              لاگ ان / رجسٹریشن
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
