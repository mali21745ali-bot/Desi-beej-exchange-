import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Repeat, 
  Tag, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Share2,
  Sparkles,
  User,
  Check
} from 'lucide-react';
import { SeedItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSeeds } from '../context/SeedContext';

interface SeedDetailModalProps {
  seed: SeedItem;
  onClose: () => void;
  onOpenChat: (seed: SeedItem) => void;
  onEdit: (seed: SeedItem) => void;
}

export const SeedDetailModal: React.FC<SeedDetailModalProps> = ({
  seed,
  onClose,
  onOpenChat,
  onEdit,
}) => {
  const { userProfile, currentUser, isAdmin } = useAuth();
  const { deleteSeed, updateSeed, reportItem } = useSeeds();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('غلط یا گمراہ کن معلومات');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isOwner = Boolean(
    (currentUser && currentUser.uid === seed.ownerId) ||
    (userProfile && userProfile.id === seed.ownerId)
  );

  const canManage = isOwner || isAdmin;
  const isExchange = seed.type === 'exchange';

  const cleanPhone = seed.ownerPhone ? seed.ownerPhone.replace(/[^0-9]/g, '') : '';
  const cleanWhatsapp = (seed.ownerWhatsapp || seed.ownerPhone || '').replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanWhatsapp.startsWith('0') 
    ? `92${cleanWhatsapp.substring(1)}` 
    : cleanWhatsapp;

  const images = seed.images && seed.images.length > 0
    ? seed.images
    : ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'];

  const handleDelete = async () => {
    if (confirm('کیا آپ واقعی یہ اشتہار حذف کرنا چاہتے ہیں؟')) {
      await deleteSeed(seed.id);
      onClose();
    }
  };

  const handleMarkCompleted = async () => {
    const nextStatus = isExchange ? 'exchanged' : 'sold';
    await updateSeed(seed.id, { status: nextStatus });
    alert(isExchange ? 'بیج کا تبادلہ مکمل ہو گیا ہے۔' : 'اشتہار فروخت شدہ نشان زد کر دیا گیا۔');
    onClose();
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportItem('seed', seed.id, seed.title, reportReason, reportDetails);
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-auto animate-fade-in text-stone-900 border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with Close */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-black flex items-center justify-center shadow-md backdrop-blur-xs transition"
            title="بند کریں"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Media */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-stone-900">
          <img
            src={images[activeImageIndex]}
            alt={seed.title}
            className="w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap">
            {isExchange ? (
              <span className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <Repeat className="w-4 h-4" />
                <span>بیج کا تبادلہ</span>
              </span>
            ) : (
              <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <Tag className="w-4 h-4" />
                <span>برائے فروخت</span>
              </span>
            )}

            {seed.status !== 'active' && (
              <span className="bg-stone-800 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {seed.status === 'sold' ? 'فروخت شدہ' : seed.status === 'exchanged' ? 'تبادلہ مکمل' : 'غیر فعال'}
              </span>
            )}
          </div>

          {/* Price or Exchange Demand */}
          <div className="absolute bottom-4 right-4 bg-emerald-950/85 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-lg border border-emerald-500/30">
            <div className="text-[11px] text-emerald-300 font-medium">
              {isExchange ? 'شرائطِ تبادلہ' : 'قیمت'}
            </div>
            <div className="text-xl sm:text-2xl font-black">
              {isExchange ? 'مفت تبادلہ' : `${(seed.price || 0).toLocaleString()} روپے`}
            </div>
          </div>

          {/* Gallery Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-1.5 bg-black/50 p-1.5 rounded-xl backdrop-blur-xs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition ${
                    activeImageIndex === idx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-5">
          {/* Title and Location */}
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{seed.city}</span>
                {seed.location && <span className="text-stone-500">({seed.location})</span>}
              </span>
              <span className="text-stone-400">•</span>
              <span>شائع ہوا: {new Date(seed.createdAt).toLocaleDateString('ur-PK')}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
              {seed.title}
            </h2>
          </div>

          {/* Exchange details highlight if applicable */}
          {isExchange && seed.exchangeFor && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-sm">
              <span className="font-bold text-emerald-900 block mb-1">
                تبادلے میں مطلوبہ بیج:
              </span>
              <p className="text-emerald-800">{seed.exchangeFor}</p>
            </div>
          )}

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-500 block mb-0.5">دستیاب مقدار</span>
              <span className="font-bold text-stone-800 text-sm">
                {seed.quantity} {seed.unit}
              </span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-500 block mb-0.5">فصل / کیٹیگری</span>
              <span className="font-bold text-stone-800 text-sm">{seed.category}</span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-500 block mb-0.5">روئیدگی (Germination)</span>
              <span className="font-bold text-stone-800 text-sm">
                {seed.germinationRate || '90%+'}
              </span>
            </div>

            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-stone-500 block mb-0.5">دیسی / نامیاتی</span>
              <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {seed.isOrganic !== false ? 'خالص دیسی' : 'روایتی'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-2">تفصیلات و خصوصیات:</h4>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50/50 p-3.5 rounded-2xl border border-stone-100">
              {seed.description}
            </p>
          </div>

          {/* Owner Info & Direct Contact Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-stone-50 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {seed.ownerName ? seed.ownerName[0] : 'ک'}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-base">{seed.ownerName}</h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{seed.city}، پاکستان</span>
                  </p>
                </div>
              </div>

              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full">
                تصدیق شدہ کسان
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(seed);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ایپ میں چیٹ کریں</span>
              </button>

              {cleanWhatsapp && (
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(`السلام علیکم! میں نے دیسی بیج ایکسچینج پر آپ کا اشتہار دیکھا: "${seed.title}". کیا یہ ابھی دستیاب ہے؟`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition text-center"
                >
                  <span>واٹس ایپ پر رابطہ</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold text-sm shadow-sm transition text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>براہ راست کال</span>
                </a>
              )}
            </div>
          </div>

          {/* Safety Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-stone-900 mb-0.5">کسان رہنمائی و تحفظ:</span>
              کسی بھی نامعلوم شخص کو ایڈوانس رقم نہ بھیجیں۔ دیسی بیج ایکسچینج ادائیگیوں کا ذمہ دار نہیں ہے۔ اپنا سودا خود دیکھ بھال کر طے کریں۔
            </div>
          </div>

          {/* Management / Owner Controls */}
          {canManage && (
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(seed)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>اشتہار میں ترمیم</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>اشتہار حذف کریں</span>
                </button>
              </div>

              {seed.status === 'active' && (
                <button
                  onClick={handleMarkCompleted}
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition"
                >
                  {isExchange ? 'تبادلہ مکمل مارک کریں' : 'فروخت شدہ مارک کریں'}
                </button>
              )}
            </div>
          )}

          {/* Report Button */}
          {!isOwner && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-xs text-stone-400 hover:text-red-600 underline transition"
              >
                اس اشتہار یا صارف کی رپورٹ کریں
              </button>
            </div>
          )}
        </div>

        {/* Report Modal Subdialog */}
        {showReportModal && (
          <div className="absolute inset-0 bg-black/70 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 text-stone-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>اشتہار کی رپورٹ کریں</span>
                </h3>
                <button onClick={() => setShowReportModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="py-6 text-center text-emerald-700 font-bold">
                  آپ کی رپورٹ درج کر لی گئی ہے۔ ہماری ٹیم اس کا جائزہ لے گی۔ شکریہ!
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      رپورٹ کی وجہ:
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    >
                      <option value="غلط یا گمراہ کن معلومات">غلط یا گمراہ کن معلومات</option>
                      <option value="دھوکہ دہی یا جعلی قیمت">دھوکہ دہی یا جعلی قیمت</option>
                      <option value="غیر متعلقہ یا نازیبا مواد">غیر متعلقہ یا نازیبا مواد</option>
                      <option value="ایڈوانس رقم کا مطالبہ">مشکوک ایڈوانس رقم کا مطالبہ</option>
                      <option value="دیگر">دیگر مسائل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      تفصیل (اختیاری):
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={3}
                      placeholder="مسئلے کی تفصیل درج کریں..."
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold"
                    >
                      منسوخ کریں
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                      رپورٹ جمع کروائیں
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
