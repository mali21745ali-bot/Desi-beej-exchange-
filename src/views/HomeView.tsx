import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Repeat, 
  Tag, 
  MapPin, 
  Filter, 
  BookOpen, 
  ArrowLeft, 
  Sparkles, 
  Sprout, 
  Wheat, 
  Carrot,
  ShieldCheck,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { SeedItem } from '../types';
import { SEED_CATEGORIES } from '../data/seedCategories';
import { PAKISTANI_CITIES } from '../data/pakistaniCities';
import { SeedCard } from '../components/SeedCard';
import { SafetyBanner } from '../components/SafetyBanner';
import { CROP_GUIDES_DATA } from '../data/agriculturalData';

interface HomeViewProps {
  seeds: SeedItem[];
  onSelectSeed: (seed: SeedItem) => void;
  onOpenChat: (seed: SeedItem) => void;
  onOpenExchangeModal: () => void;
  onOpenSaleModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  seeds,
  onSelectSeed,
  onOpenChat,
  onOpenExchangeModal,
  onOpenSaleModal,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exchange' | 'sale'>('all');

  const filteredSeeds = useMemo(() => {
    return seeds.filter((seed) => {
      // Type
      if (typeFilter !== 'all' && seed.type !== typeFilter) return false;
      // Category
      if (selectedCategory !== 'all' && seed.category !== selectedCategory) return false;
      // City
      if (selectedCity !== 'all' && !seed.city.includes(selectedCity)) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = seed.title.toLowerCase().includes(q);
        const matchesDesc = seed.description.toLowerCase().includes(q);
        const matchesCity = seed.city.toLowerCase().includes(q);
        const matchesCat = seed.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesCat) return false;
      }
      return true;
    });
  }, [seeds, typeFilter, selectedCategory, selectedCity, searchQuery]);

  // Separate recent exchange and selling for dedicated sections
  const recentExchanges = useMemo(() => {
    return seeds.filter((s) => s.type === 'exchange' && s.status === 'active').slice(0, 4);
  }, [seeds]);

  const recentSales = useMemo(() => {
    return seeds.filter((s) => s.type === 'sale' && s.status === 'active').slice(0, 4);
  }, [seeds]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Banner with Pakistani Agricultural Theme */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>پاکستان کا روایتی بیج محفوظ کریں • کسان خوشحال، دیس خوشحال</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight font-urdu">
            دیسی بیج کا تبادلہ اور منڈی
          </h2>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
            اپنے بزرگوں کے روایتی بیج دوسرے کسان بھائیوں کے ساتھ تبدیل کریں یا خالص بیج براہ راست مناسب قیمت پر فروخت کریں۔ بغیر کسی کمیشن یا درمیانی آڑھتی کے!
          </p>

          {/* Quick Hero Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={onOpenExchangeModal}
              className="px-5 py-3.5 bg-gradient-to-l from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Repeat className="w-4 h-4" />
              <span>بیج کا مفت تبادلہ پوسٹ کریں</span>
            </button>

            <button
              onClick={onOpenSaleModal}
              className="px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-2xl font-black text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            >
              <Tag className="w-4 h-4" />
              <span>بیج برائے فروخت لگائیں</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <SafetyBanner />

      {/* Search and Filters Hub */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بیج کا نام، قسم، شہر یا فصل تلاش کریں (مثلاً: لال گندم، باسمتی، بھنڈی)..."
              className="w-full text-sm p-3.5 pr-11 rounded-2xl border border-stone-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-hidden bg-stone-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-xs text-stone-400 hover:text-stone-600 bg-stone-200 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* City Dropdown */}
          <div className="w-full sm:w-56 shrink-0 relative">
            <MapPin className="w-4 h-4 text-emerald-700 absolute right-3 top-3.5 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs p-3.5 pr-9 rounded-2xl border border-stone-200 bg-stone-50 text-stone-800 font-bold focus:border-emerald-600 outline-hidden"
            >
              <option value="all">تمام شہر (پاکستان)</option>
              {PAKISTANI_CITIES.map((c) => (
                <option key={c.urdu} value={c.urdu}>
                  {c.urdu} ({c.province})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Filter Pills: All / Exchange / Sale */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-stone-500 shrink-0 ml-1">فلٹر:</span>
          
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              typeFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            تمام اشتہارات ({seeds.length})
          </button>

          <button
            onClick={() => setTypeFilter('exchange')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              typeFilter === 'exchange'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>صرف تبادلہ (Exchange)</span>
          </button>

          <button
            onClick={() => setTypeFilter('sale')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              typeFilter === 'sale'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>صرف فروخت (Market)</span>
          </button>
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {SEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat.nameUrdu}
            </button>
          ))}
        </div>
      </div>

      {/* Main Seed Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-urdu flex items-center gap-2">
              <span>دستیاب دیسی بیجوں کی فہرست</span>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full font-sans">
                {filteredSeeds.length}
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              پاکستانی کاشتکاروں کی جانب سے پیش کردہ روایتی بیج
            </p>
          </div>
        </div>

        {filteredSeeds.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-3">
            <Sprout className="w-12 h-12 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800 text-lg">کوئی بیج نہیں ملا</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              آپ کی تلاش یا فلٹر کے مطابق کوئی اشتہار موجود نہیں ہے۔ براہ کرم فلٹر بدلیں یا اپنا نیا اشتہار لگائیں۔
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedCity('all');
                setTypeFilter('all');
              }}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              تمام فلٹرز صاف کریں
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSeeds.map((seed) => (
              <SeedCard
                key={seed.id}
                seed={seed}
                onSelect={onSelectSeed}
                onOpenChat={onOpenChat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section: Dedicated Exchange Highlights */}
      {recentExchanges.length > 0 && typeFilter === 'all' && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl font-urdu">
                  تازہ ترین بیج کا تبادلہ (Seed Exchange)
                </h3>
                <p className="text-xs text-stone-600">
                  روایتی بیج مفت تبادلے کے لیے دستیاب ہیں
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('exchange')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>تمام تبادلے دیکھیں</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentExchanges.map((seed) => (
              <SeedCard
                key={seed.id}
                seed={seed}
                onSelect={onSelectSeed}
                onOpenChat={onOpenChat}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section: Agricultural Crop Guidance Teaser */}
      <div className="bg-gradient-to-l from-stone-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-white/10 px-3 py-1 rounded-full">
              <BookOpen className="w-3.5 h-3.5" />
              <span>زرعی معلومات اور فصلوں کی رہنمائی</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-urdu">
              گندم، چاول، کپاس، مکئی، کماد اور سبزیوں کی مستند رہنمائی
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
              بوائی کا موزوں وقت، دیسی اقسام، آبپاشی کا شیڈول، کھادوں کا استعمال اور کیڑوں کے قدرتی تدارک کی مکمل معلومات۔
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('crops')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition self-start sm:self-center shrink-0 flex items-center gap-2"
          >
            <span>مکمل زرعی گائیڈ کھولیں</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Small quick crop icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          {CROP_GUIDES_DATA.slice(0, 6).map((guide) => (
            <div
              key={guide.id}
              onClick={() => onNavigateTab('crops')}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl cursor-pointer transition text-center border border-white/10"
            >
              <div className="text-base font-bold text-white mb-0.5">{guide.cropUrdu}</div>
              <div className="text-[10px] text-emerald-300">{guide.season}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
