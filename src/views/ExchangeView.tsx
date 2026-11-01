import React, { useState, useMemo } from 'react';
import { 
  Repeat, 
  Search, 
  MapPin, 
  PlusCircle, 
  Sparkles, 
  Filter, 
  Sprout,
  HelpCircle
} from 'lucide-react';
import { SeedItem } from '../types';
import { SeedCard } from '../components/SeedCard';
import { SEED_CATEGORIES } from '../data/seedCategories';
import { PAKISTANI_CITIES } from '../data/pakistaniCities';
import { SafetyBanner } from '../components/SafetyBanner';

interface ExchangeViewProps {
  seeds: SeedItem[];
  onSelectSeed: (seed: SeedItem) => void;
  onOpenChat: (seed: SeedItem) => void;
  onOpenExchangeModal: () => void;
}

export const ExchangeView: React.FC<ExchangeViewProps> = ({
  seeds,
  onSelectSeed,
  onOpenChat,
  onOpenExchangeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const exchangeSeeds = useMemo(() => {
    return seeds.filter((s) => s.type === 'exchange' && s.status === 'active');
  }, [seeds]);

  const filteredSeeds = useMemo(() => {
    return exchangeSeeds.filter((seed) => {
      if (selectedCategory !== 'all' && seed.category !== selectedCategory) return false;
      if (selectedCity !== 'all' && !seed.city.includes(selectedCity)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = seed.title.toLowerCase().includes(q);
        const matchesDesc = seed.description.toLowerCase().includes(q);
        const matchesExchange = (seed.exchangeFor || '').toLowerCase().includes(q);
        const matchesCity = seed.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesExchange && !matchesCity) return false;
      }
      return true;
    });
  }, [exchangeSeeds, selectedCategory, selectedCity, searchQuery]);

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full text-xs text-emerald-300 font-bold">
              <Repeat className="w-3.5 h-3.5" />
              <span>مفت کسان سے کسان تبادلہ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-urdu">
              دیسی اور روایتی بیجوں کا تبادلہ
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              اگر آپ کے پاس دیسی بیج ہے تو دوسرے کاشتکاروں کے ساتھ تبدیل کریں۔ روایتی بیجوں کا تحفظ ہماری زراعت اور زمین کی اصل طاقت ہے۔
            </p>
          </div>

          <button
            onClick={onOpenExchangeModal}
            className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 self-start sm:self-center shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>نیا تبادلہ اشتہار لگائیں</span>
          </button>
        </div>
      </div>

      <SafetyBanner compact />

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تبادلے کے لیے بیج تلاش کریں (مثال: گندم، کریلا، مکئی)..."
              className="w-full text-xs sm:text-sm p-3 pr-10 rounded-2xl border border-stone-200 bg-stone-50 outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="w-full sm:w-56 shrink-0 relative">
            <MapPin className="w-4 h-4 text-emerald-700 absolute right-3 top-3.5 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs p-3 pr-9 rounded-2xl border border-stone-200 bg-stone-50 font-bold focus:border-emerald-600 outline-hidden"
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

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {SEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.nameUrdu}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-stone-800 text-base flex items-center gap-2">
            <span>تبادلے کے لیے دستیاب بیج</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              {filteredSeeds.length} اشتہارات
            </span>
          </h3>
        </div>

        {filteredSeeds.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-3">
            <Repeat className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800">اس کیٹیگری میں کوئی بیج دستیاب نہیں</h4>
            <p className="text-xs text-stone-500">
              اگر آپ کے پاس دیسی بیج ہے تو سب سے پہلے تبادلے کا اشتہار لگائیں!
            </p>
            <button
              onClick={onOpenExchangeModal}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              بیج کا تبادلہ پوسٹ کریں
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
    </div>
  );
};
