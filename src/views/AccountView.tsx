import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Edit3, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Repeat, 
  Tag, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSeeds } from '../context/SeedContext';
import { PAKISTANI_CITIES } from '../data/pakistaniCities';
import { SeedItem } from '../types';

interface AccountViewProps {
  onOpenExchangeModal: () => void;
  onOpenSaleModal: () => void;
  onEditSeed: (seed: SeedItem) => void;
  onSelectSeed: (seed: SeedItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onOpenExchangeModal,
  onOpenSaleModal,
  onEditSeed,
  onSelectSeed,
  onNavigateTab,
}) => {
  const { userProfile, currentUser, isAdmin, updateProfile, logout } = useAuth();
  const { seeds, deleteSeed, updateSeed } = useSeeds();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState(userProfile?.whatsapp || '');
  const [city, setCity] = useState(userProfile?.city || 'فیصل آباد');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const currentUserId = currentUser?.uid || userProfile?.id || '';

  // Filter listings belonging to this user
  const myListings = seeds.filter((s) => s.ownerId === currentUserId);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      city: city.trim(),
      bio: bio.trim(),
    });
    setSaving(false);
    setIsEditingProfile(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleDeleteListing = async (seedId: string) => {
    if (confirm('کیا آپ واقعی یہ اشتہار حذف کرنا چاہتے ہیں؟')) {
      await deleteSeed(seedId);
    }
  };

  const handleToggleStatus = async (seed: SeedItem) => {
    const nextStatus = seed.status === 'active' 
      ? (seed.type === 'exchange' ? 'exchanged' : 'sold')
      : 'active';
    await updateSeed(seed.id, { status: nextStatus });
  };

  if (!userProfile) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto border border-stone-200 shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-xl text-stone-900 font-urdu">
          اکاؤنٹ میں داخل ہوں
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          اپنے بیجوں کے اشتہارات کا انتظام کرنے، پیغامات پڑھنے اور کسانوں سے رابطہ کرنے کے لیے لاگ ان کریں۔
        </p>
        <button
          onClick={() => onNavigateTab('home')}
          className="w-full py-3 bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md"
        >
          ہوم پیج پر جائیں اور لاگ ان کریں
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-stone-900">
      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
            <div className="relative">
              <img
                src={userProfile.photoUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt={userProfile.name}
                className="w-20 h-20 rounded-2xl object-cover bg-emerald-800 border-2 border-emerald-400 shadow-md"
              />
              {isAdmin && (
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-emerald-950 p-1 rounded-full shadow-xs" title="ایڈمن">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold font-urdu">{userProfile.name}</h2>
                {isAdmin && (
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                    ایڈمنسٹریٹر
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-emerald-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{userProfile.city}</span>
                </span>
                {userProfile.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{userProfile.phone}</span>
                  </span>
                )}
              </div>

              {userProfile.bio && (
                <p className="text-xs text-emerald-100/90 pt-1 max-w-md">
                  {userProfile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => {
                setName(userProfile.name);
                setPhone(userProfile.phone);
                setWhatsapp(userProfile.whatsapp || userProfile.phone);
                setCity(userProfile.city);
                setBio(userProfile.bio || '');
                setIsEditingProfile(!isEditingProfile);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>پروفائل میں ترمیم</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigateTab('admin')}
                className="px-4 py-2 bg-amber-400 text-emerald-950 hover:bg-amber-300 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ایڈمن پینل</span>
              </button>
            )}

            <button
              onClick={logout}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition"
              title="لاگ آؤٹ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>آپ کی پروفائل معلومات کامیابی کے ساتھ اپڈیٹ ہو گئی ہیں!</span>
        </div>
      )}

      {/* Edit Profile Form Subpanel */}
      {isEditingProfile && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-700" />
            <span>پروفائل معلومات میں ترمیم کریں</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">نام یا فارم کا نام:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">موبائل فون نمبر:</label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-left font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">واٹس ایپ نمبر:</label>
              <input
                type="tel"
                dir="ltr"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-left font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">شہر / ضلع:</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.urdu} value={c.urdu}>
                    {c.urdu} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">تعارف یا فارمنگ کا تجربہ (Bio):</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اپنے فارم یا بیجوں کے ذخیرے کے بارے میں کچھ لکھیں..."
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-bold"
              >
                منسوخ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold"
              >
                {saving ? 'محفوظ ہو رہا ہے...' : 'تبدیلیاں محفوظ کریں'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-stone-900 font-urdu flex items-center gap-2">
              <span>میرے بیجوں کے اشتہارات (My Listings)</span>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full">
                {myListings.length}
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              آپ کے لگائے ہوئے تبادلے اور فروخت کے اشتہارات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenExchangeModal}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>تبادلہ لگائیں</span>
            </button>
            <button
              onClick={onOpenSaleModal}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>فروخت لگائیں</span>
            </button>
          </div>
        </div>

        {myListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-3">
            <Sparkles className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800">آپ نے ابھی تک کوئی اشتہار نہیں لگایا</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              اپنے روایتی دیسی بیجوں کا اشتہار لگائیں تاکہ دوسرے کاشتکار آپ سے رابطہ کر سکیں۔
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={onOpenExchangeModal}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                بیج کا تبادلہ پوسٹ کریں
              </button>
              <button
                onClick={onOpenSaleModal}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                بیج برائے فروخت لگائیں
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map((seed) => {
              const isExchange = seed.type === 'exchange';

              return (
                <div
                  key={seed.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={seed.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'}
                      alt={seed.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                    />

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isExchange ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isExchange ? 'بیج کا تبادلہ' : 'برائے فروخت'}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          seed.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-stone-200 text-stone-700'
                        }`}>
                          {seed.status === 'active' ? 'فعال (Active)' : seed.status === 'sold' ? 'فروخت شدہ' : 'تبادلہ مکمل'}
                        </span>
                      </div>

                      <h4 
                        onClick={() => onSelectSeed(seed)}
                        className="font-bold text-stone-900 text-sm hover:text-emerald-800 cursor-pointer"
                      >
                        {seed.title}
                      </h4>

                      <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                        <span>مقدار: {seed.quantity} {seed.unit}</span>
                        <span>•</span>
                        <span>{isExchange ? 'مفت تبادلہ' : `${(seed.price || 0).toLocaleString()} روپے`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleStatus(seed)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                    >
                      {seed.status === 'active' 
                        ? (isExchange ? 'تبادلہ مکمل مارک کریں' : 'فروخت شدہ مارک کریں') 
                        : 'دوبارہ فعال کریں'}
                    </button>

                    <button
                      onClick={() => onEditSeed(seed)}
                      className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-xl"
                      title="ترمیم کریں"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteListing(seed.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      title="حذف کریں"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
