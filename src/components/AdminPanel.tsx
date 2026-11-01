import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  Ban, 
  BookOpen, 
  TrendingUp, 
  ArrowRight,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSeeds } from '../context/SeedContext';
import { CROP_GUIDES_DATA } from '../data/agriculturalData';
import { SeedItem } from '../types';

interface AdminPanelProps {
  onBackToApp: () => void;
  onSelectSeed: (seed: SeedItem) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp, onSelectSeed }) => {
  const { isAdmin, userProfile } = useAuth();
  const { seeds, deleteSeed, reports, resolveReport } = useSeeds();

  const [activeTab, setActiveTab] = useState<'stats' | 'seeds' | 'reports' | 'users' | 'crops'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [suspendedUserIds, setSuspendedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('desi_beej_suspended_users');
    return saved ? JSON.parse(saved) : [];
  });

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-900 rounded-3xl p-8 text-center max-w-md mx-auto my-12 space-y-3">
        <ShieldCheck className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-xl font-bold font-urdu">رسائی ممنوع (Access Denied)</h3>
        <p className="text-xs text-red-700">
          صرف مجاز ایڈمنسٹریٹرز ہی اس پینل تک رسائی حاصل کر سکتے ہیں۔
        </p>
        <button
          onClick={onBackToApp}
          className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold"
        >
          واپس جائیں
        </button>
      </div>
    );
  }

  // Statistics calculation
  const totalListings = seeds.length;
  const exchangeCount = seeds.filter((s) => s.type === 'exchange').length;
  const saleCount = seeds.filter((s) => s.type === 'sale').length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const handleToggleSuspendUser = (userId: string) => {
    let updated: string[];
    if (suspendedUserIds.includes(userId)) {
      updated = suspendedUserIds.filter((id) => id !== userId);
    } else {
      updated = [...suspendedUserIds, userId];
    }
    setSuspendedUserIds(updated);
    localStorage.setItem('desi_beej_suspended_users', JSON.stringify(updated));
  };

  const handleDeleteListing = async (seedId: string) => {
    if (confirm('ایڈمن اختیار: کیا آپ واقعی یہ اشتہار فوری حذف کرنا چاہتے ہیں؟')) {
      await deleteSeed(seedId);
    }
  };

  const filteredSeeds = seeds.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.ownerName.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-stone-900">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-urdu flex items-center gap-2">
              <span>دیسی بیج ایکسچینج - ایڈمن کنٹرول پینل</span>
              <span className="text-[10px] bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md font-sans font-black">
                ADMIN
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              صارفین کی تصدیق، اشتہارات کی مانیٹرنگ اور کسان تحفظ کا نظام
            </p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition"
        >
          <span>ایپ میں واپس جائیں</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-stone-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'stats' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>شماریات و جائزہ</span>
        </button>

        <button
          onClick={() => setActiveTab('seeds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'seeds' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>اشتہارات مانیٹرنگ ({totalListings})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 relative ${
            activeTab === 'reports' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>شکایات و رپورٹس</span>
          {pendingReportsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>صارفین اور سسپنشن</span>
        </button>

        <button
          onClick={() => setActiveTab('crops')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'crops' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>زرعی معلومات گائیڈ</span>
        </button>
      </div>

      {/* Tab Content: Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">کل اشتہارات</span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900">{totalListings}</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">بیج کا تبادلہ</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">{exchangeCount}</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">بیج برائے فروخت</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600">{saleCount}</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">زیرِ جائزہ رپورٹس</span>
              <span className="text-2xl sm:text-3xl font-black text-red-600">{pendingReportsCount}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-bold text-stone-900 text-base">ایڈمن حفاظتی گائیڈ لائنز:</h3>
            <ul className="text-xs text-stone-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>اگر کوئی صارف غیر روایتی، ہائبرڈ، یا مشکوک بیج کو "دیسی" کے طور پر پیش کرے تو اس کے اشتہار کی تصدیق کریں۔</li>
              <li>پیشگی رقم کا تقاضا کرنے والے یا دھوکہ دہی کی شکایت موصول ہونے پر فوراً اکاؤنٹ سسپنڈ کریں۔</li>
              <li>کسانوں کے موبائل اور واٹس ایپ رابطوں کا احترام کریں اور ان کا غلط استعمال روکیں۔</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab Content: Seeds Moderation */}
      {activeTab === 'seeds' && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-stone-900 text-base">اشتہارات کی مانیٹرنگ اور حذف</h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="اشتہار یا کسان کا نام تلاش کریں..."
                className="w-full text-xs p-2.5 pr-9 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredSeeds.map((seed) => (
              <div key={seed.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={seed.images?.[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'}
                    alt={seed.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        seed.type === 'exchange' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {seed.type === 'exchange' ? 'تبادلہ' : 'فروخت'}
                      </span>
                      <h4 
                        onClick={() => onSelectSeed(seed)}
                        className="font-bold text-sm text-stone-900 hover:text-emerald-700 cursor-pointer"
                      >
                        {seed.title}
                      </h4>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      کسان: {seed.ownerName} ({seed.city}) • فون: {seed.ownerPhone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteListing(seed.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف کریں</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">کسانوں کی جانب سے موصولہ شکایات</h3>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              کوئی شکایت زیرِ التوا نہیں ہے۔
            </div>
          ) : (
            <div className="divide-y divide-stone-100 space-y-2">
              {reports.map((rep) => (
                <div key={rep.id} className="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                        {rep.targetType === 'seed' ? 'اشتہار کی رپورٹ' : 'صارف کی رپورٹ'}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900">{rep.targetTitle}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rep.status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'
                      }`}>
                        {rep.status === 'pending' ? 'زیرِ جائزہ' : 'حل شدہ'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600">
                      <strong className="text-stone-900">وجہ: </strong>
                      {rep.reason}
                    </div>

                    {rep.details && (
                      <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                        {rep.details}
                      </p>
                    )}

                    <div className="text-[10px] text-stone-400">
                      رپورٹ کنندہ: {rep.reporterName} • تاریخ: {new Date(rep.createdAt).toLocaleDateString('ur-PK')}
                    </div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveReport(rep.id, 'resolved')}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        حل ہو گیا
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold"
                      >
                        خارج کریں
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">رجسٹرڈ کاشتکار اور حفاظتی پابندی</h3>

          <div className="space-y-3">
            {/* Show unique owners from seeds */}
            {Array.from(new Set(seeds.map((s) => s.ownerId))).map((uid) => {
              const seedSample = seeds.find((s) => s.ownerId === uid);
              const isSuspended = suspendedUserIds.includes(uid);

              return (
                <div key={uid} className="p-3 bg-stone-50 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{seedSample?.ownerName}</h4>
                    <div className="text-xs text-stone-500">
                      شہر: {seedSample?.city} • فون: {seedSample?.ownerPhone}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSuspendUser(uid)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSuspended
                        ? 'bg-emerald-700 text-white'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isSuspended ? 'پابندی ختم کریں (Unsuspend)' : 'اکاؤنٹ معطل کریں (Suspend)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Crops Guidance Data */}
      {activeTab === 'crops' && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-base">زرعی معلومات کا ڈیٹا بیس</h3>
          <p className="text-xs text-stone-500">
            فصلوں کی رہنمائی، بوائی، کھاد اور بیماریوں کی تجاویز
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CROP_GUIDES_DATA.map((crop) => (
              <div key={crop.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <h4 className="font-bold text-sm text-emerald-900">{crop.cropUrdu} ({crop.season})</h4>
                <div className="text-xs text-stone-600 line-clamp-2">
                  <strong>دیسی اقسام: </strong>{crop.desiVarieties}
                </div>
                <div className="text-xs text-stone-600 line-clamp-2">
                  <strong>بوائی: </strong>{crop.sowingPeriod}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
