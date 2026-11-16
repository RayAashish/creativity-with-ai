import React, { useState, useEffect } from 'react';
import { X, Coffee, Heart, Check, Copy, Download, Sparkles, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(59);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyPayee = () => {
    navigator.clipboard.writeText('Aashish Kumar Ray');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tiers = [
    { amount: 29, label: 'Cutting Chai', desc: 'Syntax check & bug-fix fuel', icon: '☕' },
    { amount: 59, label: 'Filter Coffee', desc: 'Prefix sum & binary search boost', icon: '☕', popular: true },
    { amount: 99, label: 'Cold Brew', desc: 'Deep DP state transition power', icon: '🥤' },
    { amount: 199, label: 'SP Celebration', desc: 'Cracked the round! Placement party', icon: '🚀' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-paper-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 sticky top-0 bg-paper-50 dark:bg-neutral-900 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Coffee size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span>Buy Me a Coffee · Support the Developer</span>
              </h2>
              <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Independent Developer Project · Aashish Kumar Ray
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 text-xs">

          {/* Authentic Developer Note */}
          <div className="p-3.5 rounded bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/60 space-y-2.5 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              <Heart size={13} className="text-rose-500 fill-rose-500" />
              <span>A note from the developer:</span>
            </div>

            <p>
              Hey fellow engineer! 👋 I built <strong>SPDSE.Prep</strong> because clearing the <strong>Infosys Specialist Programmer (₹10.5L – ₹21L)</strong> or <strong>Digital Specialist Engineer (₹6.5L)</strong> round shouldn't mean wasting 100+ hours aimlessly grinding random LeetCode questions or paying thousands to institutes teaching obsolete patterns.
            </p>

            <p>
              Every single piece of this site — the <strong>42 verified PYQs</strong> from real 2020–2026 drives, the <strong>327 compilable 3-language solutions</strong> with fast I/O and overflow guards, the story-to-pattern trainer, and the adaptive study planner — was handcrafted with late-night caffeine to give freshers <em>maximum signal per hour</em>.
            </p>

            <div className="p-2.5 rounded bg-white/80 dark:bg-neutral-900/80 border border-amber-300/80 dark:border-amber-800/80 text-[11px] text-amber-950 dark:text-amber-200">
              <strong>🎉 If you cracked your SP or DSE online assessment or technical interview</strong> with the help of this site, or if it saved you days of aimless preparation, consider buying me a cup of coffee (or chai!).
            </div>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
              Your small contribution directly fuels server bandwidth, domain renewals, and the continuous addition of fresh questions from upcoming 2026 on-campus & off-campus drives — keeping this tool <strong>100% free, fast, and ad-free</strong> for every student.
            </p>
          </div>

          {/* Quick Coffee Tiers */}
          <div className="space-y-2">
            <div className="font-mono font-bold uppercase text-[10px] text-neutral-500 tracking-wider">
              Choose a Coffee Tier (or any amount you like):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tiers.map(t => (
                <button
                  key={t.amount}
                  onClick={() => setSelectedTier(t.amount)}
                  className={`p-2.5 rounded-sm border text-left transition-all relative ${
                    selectedTier === t.amount
                      ? 'border-amber-500 dark:border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 ring-1 ring-amber-500'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  {t.popular && (
                    <span className="absolute -top-2 right-1.5 px-1 py-0.2 bg-amber-500 text-white font-mono text-[8px] font-bold rounded">
                      POPULAR
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-base">{t.icon}</span>
                    <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                      ₹{t.amount}
                    </span>
                  </div>
                  <div className="font-bold text-[11px] text-neutral-800 dark:text-neutral-200 mt-1">
                    {t.label}
                  </div>
                  <div className="text-[9px] text-neutral-500 line-clamp-1 mt-0.5">
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PhonePe QR Code & Payment Card */}
          <div className="p-4 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-950 text-white space-y-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Scan & Pay with Any UPI App</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                PhonePe · Google Pay · Paytm · BHIM · Cred · Any Bank App
              </p>
            </div>

            {/* Official QR Code Image */}
            <div className="max-w-[260px] mx-auto bg-white p-2.5 rounded shadow-lg border border-neutral-800">
              <img
                src="/phonepe-qr-card.jpg"
                alt="PhonePe UPI QR Code for Aashish Kumar Ray"
                className="w-full h-auto object-contain rounded-sm"
              />
            </div>

            {/* Payee Info & Actions */}
            <div className="space-y-1 pt-1">
              <div className="font-mono text-xs font-bold text-white tracking-wide">
                Verified Payee: Aashish Kumar Ray
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                Scan QR above with PhonePe or any UPI app to send ₹{selectedTier} (or custom)
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleCopyPayee}
                className="px-3 py-1.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors border border-neutral-700"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Payee Copied!' : 'Copy Payee Name'}</span>
              </button>

              <a
                href="/phonepe-qr.jpg"
                download="phonepe-qr-aashish.jpg"
                className="px-3 py-1.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors border border-neutral-700"
              >
                <Download size={12} />
                <span>Save QR Code</span>
              </a>
            </div>
          </div>

          {/* Transparency / Open Source Note */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1 border-t border-neutral-200 dark:border-neutral-800">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>100% Secure Direct UPI · Zero Middlemen</span>
            </span>
            <button
              onClick={onClose}
              className="text-neutral-600 dark:text-neutral-400 hover:underline"
            >
              Back to Prep
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
