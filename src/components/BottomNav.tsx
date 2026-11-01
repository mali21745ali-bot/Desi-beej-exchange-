import React from 'react';
import { 
  Home, 
  Repeat, 
  ShoppingBag, 
  MessageSquare, 
  BookOpen, 
  User,
  ShieldAlert
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { unreadTotal } = useChat();
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: 'ہوم', icon: Home },
    { id: 'exchange', label: 'بیج کا تبادلہ', icon: Repeat },
    { id: 'market', label: 'بیج مارکیٹ', icon: ShoppingBag },
    { id: 'messages', label: 'پیغامات', icon: MessageSquare, badge: unreadTotal },
    { id: 'crops', label: 'زرعی معلومات', icon: BookOpen },
    { id: 'account', label: 'میرا اکاؤنٹ', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-2 py-1.5">
      <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition relative ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
                ) : null}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-0.5 truncate max-w-full text-center ${
                isActive ? 'font-bold' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
