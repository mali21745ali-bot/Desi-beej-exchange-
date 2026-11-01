import React, { useState } from 'react';
import { X, Bell, MessageSquare, Repeat, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'نیا پیغام موصول ہوا',
    message: 'چوہدری احمد علی رندھاوا نے دیسی لال گندم کے تبادلے کے بارے میں پیغام بھیجا ہے۔',
    time: '1 گھنٹہ قبل',
    type: 'message',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'بیج کے تبادلے کی درخواست',
    message: 'ساہیوال سے کسان بھائی نے آپ کی دیسی سبزی کے بیج کے ساتھ تبادلے کی پیشکش کی ہے۔',
    time: '3 گھنٹے قبل',
    type: 'exchange',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'ربیع کی فصلوں کا سیزن شروع',
    message: 'گندم اور سرسوں کی بوائی کا بہترین وقت جاری ہے۔ زرعی معلومات سیکشن میں نئی رہنمائی دیکھیں۔',
    time: '1 دن قبل',
    type: 'system',
    read: true,
  },
  {
    id: 'notif-4',
    title: 'حفاظتی الرٹ: کسان بھائیو ہوشیار رہیں',
    message: 'کسی نامعلوم شخص کو بیج دیکھنے سے پہلے ایڈوانس رقم ہرگز نہ بھیجیں۔',
    time: '2 دن قبل',
    type: 'alert',
    read: true,
  }
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, onNavigateTab }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('desi_beej_notifications');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('desi_beej_notifications', JSON.stringify(updated));
  };

  const handleAction = (notif: AppNotification) => {
    if (notif.type === 'message') {
      onClose();
      onNavigateTab('messages');
    } else if (notif.type === 'exchange') {
      onClose();
      onNavigateTab('exchange');
    } else if (notif.type === 'system') {
      onClose();
      onNavigateTab('crops');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto animate-fade-in text-stone-900 border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-lg font-urdu">اطلاعات اور پیغامات</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500 font-medium">تازہ ترین الرٹس</span>
          <button
            onClick={markAllAsRead}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            تمام پڑھ لی گئیں
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-stone-100 max-h-[60vh] overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleAction(notif)}
              className={`p-4 flex items-start gap-3 cursor-pointer transition ${
                !notif.read ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-stone-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                notif.type === 'message'
                  ? 'bg-blue-100 text-blue-800'
                  : notif.type === 'exchange'
                  ? 'bg-emerald-100 text-emerald-800'
                  : notif.type === 'alert'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {notif.type === 'message' ? (
                  <MessageSquare className="w-4 h-4" />
                ) : notif.type === 'exchange' ? (
                  <Repeat className="w-4 h-4" />
                ) : notif.type === 'alert' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{notif.title}</h4>
                  <span className="text-[10px] text-stone-400 font-sans">{notif.time}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
