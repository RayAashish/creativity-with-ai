import React, { useState } from 'react';
import { SubjectId, Difficulty, TestSettings } from '../../types';
import { SUBJECTS } from '../../data/subjects';
import { Timer, Zap, Award, Compass, X, Play, Clock, Sliders } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface MockSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTest: (settings: TestSettings, title: string) => void;
  initialSubject?: SubjectId;
  initialMode?: 'full_mock' | 'subject_mock' | 'tcs_nqt' | 'gate_cs' | 'custom';
}

export const MockSetupModal: React.FC<MockSetupModalProps> = ({
  isOpen,
  onClose,
  onStartTest,
  initialSubject,
  initialMode = 'full_mock'
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'subject' | 'custom'>(
    initialMode === 'subject_mock' ? 'subject' : 'presets'
  );

  // Preset configuration
  const [selectedPreset, setSelectedPreset] = useState<'full_mock' | 'tcs_nqt' | 'gate_cs'>(
    initialMode === 'tcs_nqt' ? 'tcs_nqt' : initialMode === 'gate_cs' ? 'gate_cs' : 'full_mock'
  );

  // Subject mock configuration
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(initialSubject || 'dsa');
  const [subjectDifficulty, setSubjectDifficulty] = useState<'all' | Difficulty>('all');
  const [subjectQuestionCount, setSubjectQuestionCount] = useState<number>(20);
  const [subjectDuration, setSubjectDuration] = useState<number>(25);

  // Custom configuration
  const [customSubject, setCustomSubject] = useState<SubjectId | 'all'>('all');
  const [customDifficulty, setCustomDifficulty] = useState<'all' | Difficulty>('all');
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<number>(30);
  const [hasTimer, setHasTimer] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleLaunch = () => {
    sounds.playFanfare();

    if (activeTab === 'presets') {
      if (selectedPreset === 'full_mock') {
        onStartTest(
          {
            mode: 'full_mock',
            questionCount: 30,
            durationMinutes: 35,
            hasTimer: true
          },
          'Full CS Comprehensive Mock Test (Balanced 6 Subjects)'
        );
      } else if (selectedPreset === 'tcs_nqt') {
        onStartTest(
          {
            mode: 'tcs_nqt',
            questionCount: 30,
            durationMinutes: 30,
            hasTimer: true
          },
          'TCS NQT & Campus Placement Special Mock'
        );
      } else if (selectedPreset === 'gate_cs') {
        onStartTest(
          {
            mode: 'gate_cs',
            questionCount: 30,
            durationMinutes: 45,
            hasTimer: true
          },
          'GATE CS High-Yield Challenge Mock'
        );
      }
    } else if (activeTab === 'subject') {
      const subj = SUBJECTS.find(s => s.id === selectedSubject);
      onStartTest(
        {
          mode: 'subject_mock',
          subjectId: selectedSubject,
          difficulty: subjectDifficulty,
          questionCount: subjectQuestionCount,
          durationMinutes: subjectDuration,
          hasTimer: true
        },
        `${subj?.name} Subject Mastery Mock (${subjectQuestionCount} Qs)`
      );
    } else {
      onStartTest(
        {
          mode: 'custom',
          subjectId: customSubject === 'all' ? undefined : customSubject,
          difficulty: customDifficulty,
          questionCount: customQuestionCount,
          durationMinutes: customDuration,
          hasTimer
        },
        `Custom CS Mock Test (${customQuestionCount} Qs)`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Configure Mock Practice Test
              </h2>
              <p className="text-xs text-slate-500">
                Balanced distribution, customizable timers & deep post-test analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('presets');
            }}
            className={`pb-3 px-2 border-b-2 transition ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Curated Exam Presets
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('subject');
            }}
            className={`pb-3 px-2 border-b-2 transition ${
              activeTab === 'subject'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Subject-Wise Mock
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('custom');
            }}
            className={`pb-3 px-2 border-b-2 transition ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Parameters
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedPreset('full_mock');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPreset === 'full_mock'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Full CS Comprehensive Mock Test
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Exactly 5 questions randomly drawn from each of the 6 subjects: DSA, Networks, OOPs, DBMS, OS & Aptitude.
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <div>30 Questions</div>
                    <div className="text-slate-400 font-normal">35 Minutes</div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedPreset('tcs_nqt');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPreset === 'tcs_nqt'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        TCS NQT & Campus Placement Special
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        High-speed mock tailored for campus hiring: Quantitative math, Logical reasoning, C++/Java OOPs, and basic DSA.
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    <div>30 Questions</div>
                    <div className="text-slate-400 font-normal">30 Minutes</div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedPreset('gate_cs');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPreset === 'gate_cs'
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        GATE CS High-Yield Challenge
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Deep conceptual & numerical problems: Recurrence relations, Subnet calculations, 2PL serializability, and Virtual memory EMAT.
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <div>30 Questions</div>
                    <div className="text-slate-400 font-normal">45 Minutes</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBJECT-WISE MOCK */}
          {activeTab === 'subject' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUBJECTS.map(s => {
                    const active = selectedSubject === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedSubject(s.id);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {s.shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Difficulty Mix
                  </label>
                  <select
                    value={subjectDifficulty}
                    onChange={e => setSubjectDifficulty(e.target.value as 'all' | Difficulty)}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Balanced (All Levels)</option>
                    <option value="easy">Easy Only (Concepts)</option>
                    <option value="medium">Medium Only (NQT)</option>
                    <option value="hard">Hard Only (GATE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Questions
                  </label>
                  <select
                    value={subjectQuestionCount}
                    onChange={e => setSubjectQuestionCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={30}>30 Questions</option>
                    <option value={50}>50 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Timer Limit
                  </label>
                  <select
                    value={subjectDuration}
                    onChange={e => setSubjectDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={25}>25 Minutes</option>
                    <option value={40}>40 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Subject Scope
                  </label>
                  <select
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value as SubjectId | 'all')}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">All 6 Subjects Interleaved</option>
                    {SUBJECTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={e => setCustomDifficulty(e.target.value as 'all' | Difficulty)}
                    className="w-full p-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">All Difficulties Mixed</option>
                    <option value="easy">Easy (Concept Clearing)</option>
                    <option value="medium">Medium (TCS NQT / Placements)</option>
                    <option value="hard">Hard (GATE Level)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Total Questions: {customQuestionCount}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={customQuestionCount}
                    onChange={e => setCustomQuestionCount(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Exam Timer: {hasTimer ? `${customDuration} Minutes` : 'Untimed Practice'}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    disabled={!hasTimer}
                    value={customDuration}
                    onChange={e => setCustomDuration(Number(e.target.value))}
                    className="w-full accent-indigo-600 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="timerToggle"
                  checked={hasTimer}
                  onChange={e => setHasTimer(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />
                <label htmlFor="timerToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Enable Countdown Timer with low-time alerts
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Test Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
