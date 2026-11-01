import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Search, 
  MapPin, 
  PlusCircle, 
  ArrowUpDown, 
  SlidersHorizontal,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { SeedItem } from '../types';
import { SeedCard } from '../components/SeedCard';
import { SEED_CATEGORIES } from '../data/seedCategories';
import { PAKISTANI_CITIES } from '../data/pakistaniCities';
import { SafetyBanner } from '../components/SafetyBanner';

interface MarketViewProps {
  seeds: SeedItem[];
  onSelectSeed: (seed: SeedItem) => void;
  onOpenChat: (seed: SeedItem) => void;
  onOpenSaleModal: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  seeds,
  onSelectSeed,
  onOpenChat,
  onOpenSaleModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const saleSeeds = useMemo(() => {
    return seeds.filter((s) => s.type === 'sale' && s.status === 'active');
  }, [seeds]);

  const filteredSeeds = useMemo(() => {
    let result = saleSeeds.filter((seed) => {
      if (selectedCategory !== 'all' && seed.category !== selectedCategory) return false;
      if (selectedCity !== 'all' && !seed.city.includes(selectedCity)) return false;
      if (maxPrice && (seed.price || 0) > Number(maxPrice)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = seed.title.toLowerCase().includes(q);
        const matchesDesc = seed.description.toLowerCase().includes(q);
        const matchesCity = seed.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity) return false;
      }
      return true;
    });

    if (sortBy === 'price_low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [saleSeeds, selectedCategory, selectedCity, maxPrice, searchQuery, sortBy]);

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-950/60 px-3 py-1 rounded-full text-xs text-amber-300 font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>براہ راست کسان منڈی - بغیر آڑھتی کمیشن</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-urdu">
              دیسی بیج مارکیٹ (بیج برائے فروخت)
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl leading-relaxed">
              پاکستان بھر کے کسانوں سے خالص روایتی بیج باآسانی خریدیں یا اپنی فصل کا بیج اچھے داموں فروخت کریں۔
            </p>
          </div>

          <button
            onClick={onOpenSaleModal}
            className="px-5 py-3.5 bg-white text-emerald-950 hover:bg-amber-100 font-black rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 self-start sm:self-center shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-800" />
            <span>بیج فروخت کے لیے لگائیں</span>
          </button>
        </div>
      </div>

      <SafetyBanner compact />

      {/* Search and Filters Hub */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بیج تلاش کریں (مثال: دھان، چنا، سرسوں)..."
              className="w-full text-xs sm:text-sm p-3 pr-10 rounded-2xl border border-stone-200 bg-stone-50 outline-hidden focus:border-amber-600"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-amber-700 absolute right-3 top-3.5 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs p-3 pr-9 rounded-2xl border border-stone-200 bg-stone-50 font-bold focus:border-amber-600 outline-hidden"
            >
              <option value="all">تمام شہر (پاکستان)</option>
              {PAKISTANI_CITIES.map((c) => (
                <option key={c.urdu} value={c.urdu}>
                  {c.urdu} ({c.province})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-stone-400 absolute right-3 top-3.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full text-xs p-3 pr-9 rounded-2xl border border-stone-200 bg-stone-50 font-bold focus:border-amber-600 outline-hidden"
            >
              <option value="newest">ترتیب: تازہ ترین اشتہارات</option>
              <option value="price_low">قیمت: کم سے زیادہ</option>
              <option value="price_high">قیمت: زیادہ سے کم</option>
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
                  ? 'bg-amber-700 text-white shadow-xs'
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
            <span>فروخت کے لیے دستیاب بیج</span>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              {filteredSeeds.length} اشتہارات
            </span>
          </h3>
        </div>

        {filteredSeeds.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-stone-300 space-y-3">
            <Tag className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800">اس فلٹر میں کوئی بیج موجود نہیں</h4>
            <p className="text-xs text-stone-500">
              آپ اپنے بیج کا نیا اشتہار لگا کر دیگر کسانوں تک پہنچ سکتے ہیں۔
            </p>
            <button
              onClick={onOpenSaleModal}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold"
            >
              بیج برائے فروخت لگائیں
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
