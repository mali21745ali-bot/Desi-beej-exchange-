import React, { useState } from 'react';
import { X, Phone, User, MapPin, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PAKISTANI_CITIES } from '../data/pakistaniCities';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signInWithGoogle, quickFarmerLogin } = useAuth();
  const [tab, setTab] = useState<'quick' | 'google'>('quick');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('فیصل آباد');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('براہ کرم اپنا پورا نام درج کریں۔');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('براہ کرم درست موبائل فون نمبر درج کریں۔');
      return;
    }

    try {
      setLoading(true);
      await quickFarmerLogin(name, phone, city, whatsapp || phone);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'لاگ ان میں دشواری پیش آئی۔');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('گوگل سائن ان میں دشواری پیش آئی۔ آپ نیچے دیے گئے موبائل لاگ ان سے بھی جاری رکھ سکتے ہیں۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto animate-fade-in text-stone-900 border border-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl">کسان لاگ ان و رجسٹریشن</h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              دیسی بیج ایکسچینج فیملی میں خوش آمدید
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-5 space-y-4">
          <div className="flex border-b border-stone-200 pb-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setTab('quick')}
              className={`pb-2 px-3 border-b-2 transition ${
                tab === 'quick' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-stone-500'
              }`}
            >
              موبائل سے رجسٹریشن (آسان)
            </button>
            <button
              onClick={() => setTab('google')}
              className={`pb-2 px-3 border-b-2 transition ${
                tab === 'google' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-stone-500'
              }`}
            >
              گوگل اکاؤنٹ (Google)
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'quick' ? (
            <form onSubmit={handleQuickSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  آپ کا نام (یا کسان/فارم کا نام) <span className="text-red-500">*</span>:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: ملک اسلم یا رندھاوا فارمز"
                    className="w-full text-sm p-3 pr-10 rounded-xl border border-stone-200 bg-stone-50 outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  موبائل نمبر (رابطے کے لیے) <span className="text-red-500">*</span>:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full text-sm p-3 pr-10 rounded-xl border border-stone-200 bg-stone-50 outline-hidden focus:border-emerald-600 text-left font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  واٹس ایپ نمبر (اگر مختلف ہے تو):
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="03001234567"
                    className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-stone-50 outline-hidden focus:border-emerald-600 text-left font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  شہر / ضلع منتخب کریں <span className="text-red-500">*</span>:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute right-3 top-3.5" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm p-3 pr-10 rounded-xl border border-stone-200 bg-stone-50 outline-hidden focus:border-emerald-600"
                  >
                    {PAKISTANI_CITIES.map((c) => (
                      <option key={c.urdu} value={c.urdu}>
                        {c.urdu} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-2xl shadow-md transition text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'داخل ہو رہے ہیں...' : 'پروفائل بنائیں اور جاری رکھیں'}
                </button>
              </div>

              <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                آپ کا فون نمبر اور واٹس ایپ صرف بیجوں کے تبادلے یا خریداری کے خواہشمند کسانوں سے رابطے کے لیے استعمال ہوگا۔
              </p>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs text-stone-600 leading-relaxed">
                اپنے مستند گوگل اکاؤنٹ سے ایک کلک میں لاگ ان کریں۔ آپ کی معلومات مکمل محفوظ ہیں۔
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 border-2 border-stone-200 hover:border-emerald-600 rounded-2xl text-stone-800 font-bold text-sm shadow-xs transition flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google کے ذریعے لاگ ان کریں</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
