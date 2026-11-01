import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Sprout, 
  Wheat, 
  Cloud, 
  Sun, 
  TreePine, 
  Carrot, 
  CircleDot, 
  Droplet, 
  Layers, 
  Bug, 
  Calendar, 
  Scissors,
  CheckCircle,
  Sparkles,
  Share2
} from 'lucide-react';
import { CROP_GUIDES_DATA } from '../data/agriculturalData';
import { CropGuideItem } from '../types';

export const CropInfoView: React.FC = () => {
  const [selectedCropId, setSelectedCropId] = useState<string>(CROP_GUIDES_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCrop: CropGuideItem = CROP_GUIDES_DATA.find((c) => c.id === selectedCropId) || CROP_GUIDES_DATA[0];

  const filteredCrops = CROP_GUIDES_DATA.filter((crop) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      crop.cropUrdu.toLowerCase().includes(q) ||
      crop.cropEng.toLowerCase().includes(q) ||
      crop.desiVarieties.toLowerCase().includes(q) ||
      crop.season.toLowerCase().includes(q)
    );
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `زرعی رہنمائی: ${activeCrop.cropUrdu}`,
        text: `${activeCrop.cropUrdu} کی کاشت اور بیج کی مکمل رہنمائی - دیسی بیج ایکسچینج`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${activeCrop.cropUrdu}: ${activeCrop.desiVarieties}`);
      alert('معلومات کاپی کر لی گئی ہیں!');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-stone-900">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/80 px-3 py-1 rounded-full text-xs text-emerald-200 font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>مستند پاکستانی زرعی کونسل و کسان رہنمائی</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-urdu">
            زرعی معلومات اور فصلوں کی رہنمائی
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-light">
            گندم، چاول، کپاس، مکئی، کماد اور سبزیوں کے روایتی بیجوں کے انتخاب، کھادوں کے متوازن استعمال، آبپاشی اور کیڑوں کے قدرتی تدارک کی جامع معلومات۔
          </p>
        </div>
      </div>

      {/* Crop Selector Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CROP_GUIDES_DATA.map((crop) => {
          const isSelected = crop.id === selectedCropId;

          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCropId(crop.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>{crop.cropUrdu}</span>
            </button>
          );
        })}
      </div>

      {/* Main Crop Detailed Guide Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-5 sm:p-8 space-y-6">
        {/* Crop Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="inline-block text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full mb-1">
              موسم: {activeCrop.season}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-urdu">
              {activeCrop.cropUrdu} کی کاشت اور نگہداشت
            </h3>
          </div>

          <button
            onClick={handleShare}
            className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition"
          >
            <Share2 className="w-4 h-4" />
            <span>رہنمائی شیئر کریں</span>
          </button>
        </div>

        {/* 6 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Seed Selection & Desi Varieties */}
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
              <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
              <h4>1. بیج کا انتخاب اور روایتی اقسام</h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeCrop.desiVarieties}
            </p>
          </div>

          {/* 2. Sowing Period & Seed Rate */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
              <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
              <h4>2. بوائی کا موزوں وقت اور شرحِ بیج</h4>
            </div>
            <div className="text-xs sm:text-sm text-stone-700 space-y-1.5 leading-relaxed">
              <div>
                <strong className="text-stone-900">وقتِ بوائی: </strong>
                {activeCrop.sowingPeriod}
              </div>
              <div>
                <strong className="text-stone-900">شرح بیج فی ایکڑ: </strong>
                {activeCrop.seedRate}
              </div>
            </div>
          </div>

          {/* 3. Irrigation */}
          <div className="bg-sky-50/60 border border-sky-200/70 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sky-950 font-bold text-base">
              <Droplet className="w-5 h-5 text-sky-700 shrink-0" />
              <h4>3. آبپاشی کا شیڈول (پانی کی ضرورت)</h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeCrop.irrigation}
            </p>
          </div>

          {/* 4. Fertilizer Guidance */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-base">
              <Layers className="w-5 h-5 text-amber-700 shrink-0" />
              <h4>4. کھادوں کا متوازن اور دیسی استعمال</h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeCrop.fertilizer}
            </p>
          </div>

          {/* 5. Common Diseases & Pest Management */}
          <div className="bg-red-50/50 border border-red-200/70 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-950 font-bold text-base">
              <Bug className="w-5 h-5 text-red-700 shrink-0" />
              <h4>5. بیماریاں اور کیڑوں کا قدرتی تدارک</h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeCrop.pestsAndDiseases}
            </p>
          </div>

          {/* 6. Harvesting & Traditional Storage */}
          <div className="bg-lime-50/60 border border-lime-200/70 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-lime-950 font-bold text-base">
              <Scissors className="w-5 h-5 text-lime-800 shrink-0" />
              <h4>6. کٹائی اور بیج محفوظ کرنے کے طریقے</h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeCrop.harvesting}
            </p>
          </div>
        </div>

        {/* Traditional Farmer Advice Box */}
        <div className="p-4 bg-emerald-900 text-emerald-50 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
          <CheckCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-white font-bold text-sm mb-0.5">
              روایتی دیسی بیجوں کا کسان نکتہ:
            </strong>
            دیسی بیج کیڑوں اور بیماریوں کے خلاف قدرتی قوتِ مدافعت رکھتے ہیں اور انہیں کم سے کم کیمیائی سپرے اور کھادوں کی ضرورت ہوتی ہے۔ اپنی اگلی فصل کے لیے بہترین سٹوں یا پھلوں سے بیج پہلے سے الگ کر کے دھوپ میں سکھا کر نیم کے پتوں کے ساتھ مٹی کے برتنوں میں محفوظ کریں۔
          </div>
        </div>
      </div>
    </div>
  );
};
