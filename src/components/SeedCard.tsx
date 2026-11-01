import React from 'react';
import { 
  MapPin, 
  Repeat, 
  Tag, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Calendar,
  Share2
} from 'lucide-react';
import { SeedItem } from '../types';
import { useChat } from '../context/ChatContext';

interface SeedCardProps {
  seed: SeedItem;
  onSelect: (seed: SeedItem) => void;
  onOpenChat?: (seed: SeedItem) => void;
}

export const SeedCard: React.FC<SeedCardProps> = ({ seed, onSelect, onOpenChat }) => {
  const isExchange = seed.type === 'exchange';
  const cleanPhone = seed.ownerPhone ? seed.ownerPhone.replace(/[^0-9]/g, '') : '';
  const cleanWhatsapp = (seed.ownerWhatsapp || seed.ownerPhone || '').replace(/[^0-9]/g, '');
  
  // Format WhatsApp link for Pakistan numbers (e.g. 0300... -> 92300...)
  const formattedWhatsappNumber = cleanWhatsapp.startsWith('0') 
    ? `92${cleanWhatsapp.substring(1)}` 
    : cleanWhatsapp;

  const coverImage = seed.images && seed.images.length > 0 
    ? seed.images[0] 
    : 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: seed.title,
        text: `دیسی بیج ایکسچینج: ${seed.title} - ${seed.city}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${seed.title} - رابطہ: ${seed.ownerPhone}`);
      alert('اشتہار کا لنک کاپی ہو گیا ہے!');
    }
  };

  return (
    <div 
      onClick={() => onSelect(seed)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/60 transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Image & Type Badge */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img 
            src={coverImage} 
            alt={seed.title} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay Tag */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {isExchange ? (
              <span className="bg-emerald-700/95 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Repeat className="w-3.5 h-3.5" />
                <span>بیج کا تبادلہ</span>
              </span>
            ) : (
              <span className="bg-amber-600/95 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Tag className="w-3.5 h-3.5" />
                <span>برائے فروخت</span>
              </span>
            )}

            {seed.isOrganic && (
              <span className="bg-emerald-900/90 text-emerald-100 text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs">
                خالص دیسی
              </span>
            )}
          </div>

          {/* Price / Exchange Demand Pill at Bottom Left */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
            {isExchange ? (
              <span className="text-emerald-300">مفت تبادلہ</span>
            ) : (
              <span>{(seed.price || 0).toLocaleString()} روپے</span>
            )}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition"
            title="اشتہار شیئر کریں"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5">
          {/* City and Quantity */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{seed.city}</span>
            </span>

            <span className="font-medium text-stone-600">
              دستیاب مقدار: {seed.quantity} {seed.unit}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {seed.title}
          </h3>

          {/* Exchange Condition if applicable */}
          {isExchange && seed.exchangeFor && (
            <p className="text-xs text-stone-600 mt-1.5 bg-stone-50 p-1.5 rounded-lg border border-stone-100 line-clamp-1">
              <span className="font-bold text-stone-800">مطلوبہ بیج: </span>
              {seed.exchangeFor}
            </p>
          )}

          {/* Brief Description */}
          <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {seed.description}
          </p>
        </div>
      </div>

      {/* Footer & Farmer Quick Contact Bar */}
      <div className="px-3.5 pb-3.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="text-xs text-stone-600 truncate">
          <span className="font-medium text-stone-800 block truncate">{seed.ownerName}</span>
          <span className="text-[11px] text-stone-400">کسان / بیج گروور</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Direct Chat */}
          {onOpenChat && (
            <button
              onClick={() => onOpenChat(seed)}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
              title="ایپ میں چیٹ کریں"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">چیٹ</span>
            </button>
          )}

          {/* WhatsApp */}
          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${formattedWhatsappNumber}?text=${encodeURIComponent(`السلام علیکم! میں نے دیسی بیج ایکسچینج پر آپ کا اشتہار دیکھا: "${seed.title}". کیا یہ ابھی دستیاب ہے؟`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1 text-xs font-semibold shadow-xs"
              title="واٹس ایپ پر رابطہ کریں"
            >
              <span className="font-bold text-xs">واٹس ایپ</span>
            </a>
          )}

          {/* Call */}
          {cleanPhone && (
            <a
              href={`tel:${cleanPhone}`}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition"
              title="فون کال کریں"
            >
              <Phone className="w-4 h-4 text-stone-700" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
