import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Repeat, 
  Tag, 
  MapPin, 
  Sparkles, 
  Check, 
  Trash2,
  AlertCircle 
} from 'lucide-react';
import { SeedItem, SeedType } from '../types';
import { SEED_CATEGORIES } from '../data/seedCategories';
import { PAKISTANI_CITIES } from '../data/pakistaniCities';
import { useAuth } from '../context/AuthContext';
import { useSeeds } from '../context/SeedContext';

interface SeedFormModalProps {
  initialData?: SeedItem | null;
  defaultType?: SeedType;
  onClose: () => void;
  onSuccess: (seedId: string) => void;
}

export const SeedFormModal: React.FC<SeedFormModalProps> = ({
  initialData,
  defaultType = 'exchange',
  onClose,
  onSuccess,
}) => {
  const { userProfile } = useAuth();
  const { addSeed, updateSeed } = useSeeds();

  const [type, setType] = useState<SeedType>(initialData?.type || defaultType);
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'wheat');
  const [price, setPrice] = useState<number | ''>(initialData?.price || (defaultType === 'sale' ? 1000 : 0));
  const [quantity, setQuantity] = useState(initialData?.quantity || '10');
  const [unit, setUnit] = useState(initialData?.unit || 'کلوگرام');
  const [city, setCity] = useState(initialData?.city || userProfile?.city || 'فیصل آباد');
  const [location, setLocation] = useState(initialData?.location || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [exchangeFor, setExchangeFor] = useState(initialData?.exchangeFor || '');
  const [harvestYear, setHarvestYear] = useState(initialData?.harvestYear || '2026');
  const [germinationRate, setGerminationRate] = useState(initialData?.germinationRate || '90%+');
  const [isOrganic, setIsOrganic] = useState(initialData?.isOrganic !== false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compress and convert image to lightweight Data URI for low-bandwidth mobile
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Lightweight JPEG format 0.75
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setImages((prev) => [...prev.slice(0, 4), compressed]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('براہ کرم بیج کا نام درج کریں۔');
      return;
    }
    if (!quantity.trim()) {
      setErrorMsg('براہ کرم دستیاب مقدار درج کریں۔');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('براہ کرم شہر یا ضلع منتخب کریں۔');
      return;
    }
    if (type === 'sale' && (!price || Number(price) <= 0)) {
      setErrorMsg('براہ کرم فروخت کے لیے بیج کی مناسب قیمت درج کریں۔');
      return;
    }

    try {
      setSubmitting(true);

      const defaultPlaceholderImages = [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
      ];

      const finalImages = images.length > 0 ? images : defaultPlaceholderImages;

      if (initialData) {
        // Edit existing
        await updateSeed(initialData.id, {
          title: title.trim(),
          type,
          category,
          price: type === 'sale' ? Number(price) : 0,
          quantity: quantity.trim(),
          unit,
          city: city.trim(),
          location: location.trim(),
          description: description.trim(),
          exchangeFor: type === 'exchange' ? exchangeFor.trim() : '',
          harvestYear,
          germinationRate,
          isOrganic,
          images: finalImages,
        });
        onSuccess(initialData.id);
      } else {
        // Create new
        const newId = await addSeed({
          title: title.trim(),
          type,
          category,
          price: type === 'sale' ? Number(price) : 0,
          quantity: quantity.trim(),
          unit,
          city: city.trim(),
          location: location.trim(),
          description: description.trim() || 'خالص روایتی دیسی بیج برائے تبادلہ یا فروخت۔',
          exchangeFor: type === 'exchange' ? exchangeFor.trim() : '',
          harvestYear,
          germinationRate,
          isOrganic,
          images: finalImages,
          status: 'active'
        });
        onSuccess(newId);
      }
    } catch (err: any) {
      console.error('Error saving seed listing:', err);
      setErrorMsg(err.message || 'اشتہار محفوظ کرنے میں دشواری پیش آئی۔');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-auto animate-fade-in text-stone-900 border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              {type === 'exchange' ? <Repeat className="w-5 h-5 text-emerald-300" /> : <Tag className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl">
                {initialData ? 'اشتہار میں ترمیم کریں' : type === 'exchange' ? 'دیسی بیج برائے تبادلہ لگائیں' : 'دیسی بیج برائے فروخت لگائیں'}
              </h3>
              <p className="text-xs text-emerald-200">
                کسان بھائیوں تک اپنے روایتی اور خالص بیجوں کی معلومات پہنچائیں
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Toggle: Exchange vs Sale */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              اشتہار کی قسم منتخب کریں:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('exchange')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border-2 ${
                  type === 'exchange'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Repeat className="w-4 h-4 text-emerald-600" />
                <span>بیج کا تبادلہ (مفت)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('sale')}
                className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border-2 ${
                  type === 'sale'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Tag className="w-4 h-4 text-amber-600" />
                <span>بیج برائے فروخت (قیمت)</span>
              </button>
            </div>
          </div>

          {/* Seed Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              بیج کا نام اور قسم <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: دیسی لال گندم C-591 یا دیسی چھوٹی بھنڈی"
              className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-stone-50"
            />
          </div>

          {/* Category & Quantity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                فصل کی کیٹیگری <span className="text-red-500">*</span>:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:border-emerald-600 outline-hidden bg-stone-50"
              >
                {SEED_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameUrdu} ({cat.nameEng})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                دستیاب مقدار اور اکائی <span className="text-red-500">*</span>:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="مثال: 40"
                  className="w-2/3 text-sm p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/3 text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                >
                  <option value="کلوگرام">کلوگرام</option>
                  <option value="من">من</option>
                  <option value="گرام">گرام</option>
                  <option value="بوری / تھیلا">بوری</option>
                  <option value="پیکٹ">پیکٹ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price (if sale) OR Exchange Demand (if exchange) */}
          {type === 'sale' ? (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                قیمت (پاکستانی روپے PKR) <span className="text-red-500">*</span>:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="مثال: 3500"
                  className="w-full text-sm p-3 pl-16 rounded-xl border border-stone-200 bg-stone-50 font-bold"
                />
                <span className="absolute left-3 top-3 text-xs text-stone-500 font-bold">
                  روپے (PKR)
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تبادلے میں کیا بیج درکار ہے؟ (اختیاری):
              </label>
              <input
                type="text"
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                placeholder="مثال: دیسی چاول باسمتی یا دیسی سرسوں کا بیج"
                className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          )}

          {/* City and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                شہر / ضلع <span className="text-red-500">*</span>:
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-stone-50"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.urdu} value={c.urdu}>
                    {c.urdu} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                علاقہ / گائوں / سڑک (اختیاری):
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: ستیانہ روڈ، چک 204"
                className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          {/* Harvest year & Germination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                کٹائی کا سال:
              </label>
              <select
                value={harvestYear}
                onChange={(e) => setHarvestYear(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
              >
                <option value="2026">2026 (تازہ ترین)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                روئیدگی کا تناسب:
              </label>
              <input
                type="text"
                value={germinationRate}
                onChange={(e) => setGerminationRate(e.target.value)}
                placeholder="مثال: 92%"
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>
          </div>

          {/* Organic / Desi Checkbox */}
          <label className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm"
            />
            <span className="text-xs font-bold text-emerald-900">
              یہ بیج خالص روایتی اور کیمیائی ادویات سے پاک (Organic) تیار کیا گیا ہے۔
            </span>
          </label>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              بیج کی تصاویر اپلوڈ کریں (زیادہ سے زیادہ 4 تصاویر):
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                  <img src={img} alt="Seed" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-600 flex flex-col items-center justify-center cursor-pointer bg-stone-50 hover:bg-emerald-50/50 transition p-2 text-center">
                  <Upload className="w-5 h-5 text-stone-400 mb-1" />
                  <span className="text-[11px] font-bold text-stone-600">تصویر شامل کریں</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              تفصیل اور خصوصیات:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="بیج کے اوصاف، مدافعت، پانی کی ضرورت اور اپنے شرائطِ تبادلہ یا فروخت تفصیل سے لکھیں..."
              className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-base"
            >
              {submitting ? (
                <span>اشتہار محفوظ ہو رہا ہے...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{initialData ? 'ترمیم محفوظ کریں' : 'اشتہار شائع کریں'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
