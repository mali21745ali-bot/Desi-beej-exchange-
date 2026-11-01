import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, PhoneCall, Info } from 'lucide-react';

export const SafetyBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(!compact);

  if (compact) {
    return (
      <div className="bg-amber-50 border-r-4 border-amber-500 p-2.5 rounded-lg flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">
            ضروری تنبیہ: کسی کو بھی پیشگی رقم (Advance Payment) نہ بھیجیں۔ بیج خود دیکھ کر تبادلہ یا سودا کریں۔
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-amber-800 font-bold underline shrink-0 mr-2 hover:text-amber-950"
        >
          مزید تفصیل
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l from-amber-50 via-amber-100/50 to-emerald-50 border border-amber-300/80 rounded-2xl p-4 my-3 text-stone-800 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <span>کسان تحفظ اور اہم حفاظتی ہدایات</span>
              <span className="text-[11px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                اہم
              </span>
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              دیسی بیج ایکسچینج صرف کسانوں کو آپس میں ملانے کا ذریعہ ہے۔ تمام سودے اور تبادلے آزادانہ ہیں۔
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-stone-500 hover:text-stone-800 rounded-lg"
          title="تفصیل کھولیں یا بند کریں"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-amber-200/70 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-stone-700">
          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900 font-semibold mb-0.5">پیشگی رقم سے پرہیز:</strong>
              کسی بھی نامعلوم شخص کو ایزی پیسہ، جاز کیش یا بینک کے ذریعے ایڈوانس رقم نہ بھیجیں۔
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900 font-semibold mb-0.5">بیج کا معائنہ:</strong>
              بیج کی روئیدگی اور اصل نسل کی تصدیق خود موقع پر یا باہمی اعتماد سے کریں۔ کوئی بھی بیج حکومتی تصدیق شدہ ہونے کا جھوٹا دعویٰ نہ کرے۔
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900 font-semibold mb-0.5">مشکوک اشتہار کی رپورٹ:</strong>
              اگر کوئی اشتہار یا صارف دھوکہ دہی کی کوشش کرے تو فوری طور پر "رپورٹ کریں" بٹن دبائیں۔
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
