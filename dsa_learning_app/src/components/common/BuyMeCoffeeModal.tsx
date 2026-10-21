import React, { useState } from 'react';
import { 
  X, 
  Coffee, 
  Heart, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  CreditCard, 
  Sparkles,
  QrCode,
  ShieldCheck,
  IndianRupee,
  DollarSign
} from 'lucide-react';

interface BuyMeCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyMeCoffeeModal: React.FC<BuyMeCoffeeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeMethod, setActiveMethod] = useState<'upi' | 'paypal'>('upi');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const upiId1 = '7762878177@upi';
  const upiId2 = '2002raysi@okicici';
  const paypalId = 'raysi2002';
  const paypalUrl = `https://paypal.me/${paypalId}`;
  const upiIntentUrl = `upi://pay?pa=${upiId1}&pn=Aashish%20Ray&cu=INR`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden ring-1 ring-amber-500/20">
        {/* Warm Ambient Glow Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 relative z-10 flex items-start justify-between gap-4 bg-slate-900/95">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0 animate-bounce">
              <Coffee className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Buy Me a Coffee
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Support
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fueling independent, 100% free DSA learning for students & job seekers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex-shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Method Switcher Tabs */}
        <div className="p-4 sm:px-6 sm:py-3 border-b border-slate-800/80 bg-slate-950/70 flex gap-2 relative z-10">
          <button
            onClick={() => setActiveMethod('upi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeMethod === 'upi'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>UPI / GPay / PhonePe</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono">
              India
            </span>
          </button>

          <button
            onClick={() => setActiveMethod('paypal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeMethod === 'paypal'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>PayPal / Cards</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded font-mono">
              Global
            </span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 relative z-10 custom-scrollbar">

          {/* Tab 1: UPI / GPay / PhonePe / Paytm */}
          {activeMethod === 'upi' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* QR Code Container */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800/90 flex flex-col items-center text-center shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-2">
                  <QrCode className="w-4 h-4" />
                  <span>Scan with any UPI App (GPay, PhonePe, Paytm, CRED)</span>
                </div>

                {/* QR Image */}
                <div className="p-2.5 bg-white rounded-2xl shadow-xl max-w-[260px] sm:max-w-[280px] w-full flex items-center justify-center overflow-hidden border border-slate-200">
                  <img
                    src="/support/upi.jpeg"
                    alt="Aashish Ray GPay QR Code"
                    className="w-full h-auto object-contain rounded-xl"
                    loading="eager"
                  />
                </div>

                <div className="mt-3 text-xs text-slate-400">
                  Recipient: <span className="font-bold text-white">Aashish Ray</span>
                </div>

                {/* Direct Mobile Tap Link */}
                <a
                  href={upiIntentUrl}
                  className="mt-3.5 inline-flex sm:hidden items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 active:scale-95 transition"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Tap to Pay with UPI App</span>
                </a>
              </div>

              {/* UPI ID Copy Cards */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Or transfer directly via UPI ID:</span>
                </div>

                {/* Primary UPI ID */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Primary Mobile UPI ID
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-amber-300 truncate">
                      {upiId1}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(upiId1, 'upi1')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition active:scale-95 flex-shrink-0"
                  >
                    {copiedKey === 'upi1' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Secondary GPay UPI ID */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      GPay Banking VPA
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300 truncate">
                      {upiId2}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(upiId2, 'upi2')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition active:scale-95 flex-shrink-0"
                  >
                    {copiedKey === 'upi2' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Suggested Coffee Quantities */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-amber-400 font-bold">☕ ₹50</div>
                  <div className="text-[10px] text-slate-400">1 Cup of Chai</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-amber-400 font-bold">☕☕ ₹100</div>
                  <div className="text-[10px] text-slate-400">Double Espresso</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-amber-400 font-bold">🚀 ₹250</div>
                  <div className="text-[10px] text-slate-400">Super Supporter</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: PayPal & International */}
          {activeMethod === 'paypal' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* PayPal QR Container */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800/90 flex flex-col items-center text-center shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-2">
                  <QrCode className="w-4 h-4" />
                  <span>Scan with PayPal App or Phone Camera</span>
                </div>

                {/* PayPal QR Image */}
                <div className="p-2.5 bg-white rounded-2xl shadow-xl max-w-[260px] sm:max-w-[280px] w-full flex items-center justify-center overflow-hidden border border-slate-200">
                  <img
                    src="/support/paypal.jpeg"
                    alt="Aashish Kumar Ray PayPal QR Code"
                    className="w-full h-auto object-contain rounded-xl"
                    loading="eager"
                  />
                </div>

                <div className="mt-3 text-xs text-slate-400">
                  PayPal User: <span className="font-bold text-white">Aashish Kumar Ray</span>
                </div>

                {/* Direct PayPal Link Button */}
                <a
                  href={paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition"
                >
                  <span>Pay with PayPal (paypal.me/{paypalId})</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* PayPal ID Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    PayPal Username
                  </div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300 truncate">
                    @{paypalId}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(paypalId, 'paypal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition active:scale-95 flex-shrink-0"
                >
                  {copiedKey === 'paypal' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Suggested International Amounts */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-cyan-400 font-bold">☕ $2</div>
                  <div className="text-[10px] text-slate-400">1 Coffee</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-cyan-400 font-bold">☕☕ $5</div>
                  <div className="text-[10px] text-slate-400">2 Coffees</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <div className="text-cyan-400 font-bold">🚀 $10</div>
                  <div className="text-[10px] text-slate-400">Super Supporter</div>
                </div>
              </div>
            </div>
          )}

          {/* Gratitude & Transparency Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Open DSA Platform</span>
            </div>
            <p className="leading-relaxed">
              DSASpace was built to help engineers crack coding interviews without paying thousands for proprietary courses. Every contribution directly powers domain hosting, new visualizers, and solution guides.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/95 relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Thank you for your support!</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
