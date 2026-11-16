import React from 'react';
import {
  LayoutDashboard,
  FileCode2,
  GitBranch,
  Layers,
  History,
  Sparkles,
  Timer,
  Target,
  Wrench,
  AlertTriangle,
  CalendarDays,
  HelpCircle,
  Download,
  Upload,
  CheckCircle2,
  Flame,
  Coffee
} from 'lucide-react';
import { Logo } from './Logo';
import { LiveCounter } from './LiveCounter';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isLast48Hours: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  solvedCount: number;
  totalTrackCount: number;
  onOpenSupport?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isLast48Hours,
  mobileMenuOpen,
  setMobileMenuOpen,
  solvedCount,
  totalTrackCount,
  onOpenSupport
}) => {
  const handleItemClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navSections = [
    {
      title: 'FOUNDATION',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'blueprint', label: 'Exam Blueprint', icon: FileCode2, badge: 'Conflicts' },
        { id: 'role-tracks', label: 'Role Tracks (DSE/SP)', icon: GitBranch, badge: 'Must-Do' },
        { id: 'patterns', label: '12 Patterns Library', icon: Layers },
      ]
    },
    {
      title: 'PRACTICE & EXAM',
      items: [
        { id: 'pyq', label: 'Previous-Year (n=42)', icon: History },
        { id: 'predicted-sets', label: '52 Predicted Sets', icon: Sparkles },
        { id: 'mock-exam', label: 'Mock Exam Simulator', icon: Timer, highlight: true },
        { id: 'trainer', label: 'Pattern Trainer (216)', icon: Target },
      ]
    },
    {
      title: 'TOOLKIT & INTERVIEW',
      items: [
        { id: 'toolkit', label: 'Toolkit & Fast IO', icon: Wrench },
        { id: 'mistake-log', label: 'Mistake Log & SRS', icon: AlertTriangle },
        { id: 'study-plan', label: 'Adaptive Study Plan', icon: CalendarDays, badge: '10-45d' },
        { id: 'interview', label: 'Interview & Concepts', icon: HelpCircle, badge: 'MCQ+Trace' },
      ]
    }
  ];

  const exportProgress = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('spdse_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spdse-prep-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          Object.keys(parsed).forEach(k => {
            if (k.startsWith('spdse_')) {
              localStorage.setItem(k, parsed[k]);
            }
          });
          window.location.reload();
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed md:sticky top-14 left-0 z-20 h-[calc(100vh-3.5rem)] w-64 bg-paper-50 dark:bg-paper-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between overflow-hidden transition-transform duration-200
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-3 space-y-4 flex-1 overflow-y-auto">
          {/* Mobile brand header */}
          <div className="md:hidden pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <Logo variant="full" size="md" />
          </div>

          {/* 48 Hours Alert if Active */}
          {isLast48Hours && (
            <div className="p-2.5 rounded-sm bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <Flame size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Last 48h Mode Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                New practice locked. Focus exclusively on the Mistake Log, Toolkit templates, and Oral interview review.
              </p>
            </div>
          )}

          {/* Navigation Sections */}
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                {sec.title}
              </div>
              <nav className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  // In 48h mode, visually dim non-revision items
                  const isDimmed = isLast48Hours && !['dashboard', 'toolkit', 'mistake-log', 'interview'].includes(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors text-left group
                        ${isActive
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium'
                          : isDimmed 
                            ? 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-700'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={14} className={isActive ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200'} />
                        <span className="truncate">{item.label}</span>
                      </span>

                      {item.badge && (
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded-sm ${
                          isActive 
                            ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900'
                            : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Buy Me a Coffee Indie Card */}
          {onOpenSupport && (
            <div className="p-2.5 rounded bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/80 dark:border-amber-700/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Coffee size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>Buy Me a Coffee</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1 py-0.2 bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded">
                  UPI
                </span>
              </div>
              <p className="text-[10px] leading-tight text-neutral-600 dark:text-neutral-300">
                Cracked SP/DSE or saved prep hours? Support the developer!
              </p>
              <button
                onClick={onOpenSupport}
                className="w-full py-1 px-2 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[10px] font-bold rounded-sm transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Support with PhonePe / UPI ☕</span>
              </button>
            </div>
          )}

        </div>

        {/* Pinned Bottom Footer: Track Progress, Backup/Restore, Offline indicator, LiveCounter */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 bg-paper-50 dark:bg-paper-900 shrink-0">

          {/* Progress Mini Bar */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-neutral-500 dark:text-neutral-400">Track Progress</span>
              <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{solvedCount}/{totalTrackCount}</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-sm overflow-hidden">
              <div 
                className="h-full bg-accent dark:bg-accent-dark transition-all duration-300"
                style={{ width: `${Math.min(100, (solvedCount / (totalTrackCount || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Export / Import Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportProgress}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              title="Export progress as JSON"
            >
              <Download size={11} />
              <span>Backup</span>
            </button>
            <button
              onClick={importProgress}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-sm hover:bg-white dark:hover:bg-neutral-800 transition-colors"
              title="Restore progress from JSON"
            >
              <Upload size={11} />
              <span>Restore</span>
            </button>
          </div>

          {/* Offline Ready Badge & Live Counter */}
          <div className="pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                <span>Offline Ready (PWA)</span>
              </span>
              <span>v1.0</span>
            </div>

            {/* Global Live Active Visitor Counter */}
            <LiveCounter />
          </div>

        </div>
      </aside>
    </>
  );
};
