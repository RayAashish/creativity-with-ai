import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LearningPortal } from './components/LearningArea/LearningPortal';
import { QuestionBank } from './components/PracticeArea/QuestionBank';
import { MockSetupModal } from './components/MockTest/MockSetupModal';
import { ActiveTest } from './components/MockTest/ActiveTest';
import { TestAnalytics } from './components/MockTest/TestAnalytics';
import { FlashcardDeck } from './components/Flashcards/FlashcardDeck';
import { MistakeNotebook } from './components/MistakeNotebook/MistakeNotebook';
import { VirtualCalculator } from './components/VirtualCalculator';
import { ScratchpadModal } from './components/ScratchpadModal';
import { SubjectId, TestSettings, TestResult, TestQuestionState } from './types';
import { generateTestQuestions } from './utils/testGenerator';
import { ALL_QUESTIONS } from './data/questions';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('dsa');

  // Modals & Tools
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockModalPreset, setMockModalPreset] = useState<'full_mock' | 'subject_mock' | 'tcs_nqt' | 'gate_cs' | 'custom'>('full_mock');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Active Mock Test state
  const [activeTest, setActiveTest] = useState<{
    title: string;
    settings: TestSettings;
    questions: TestQuestionState[];
  } | null>(null);

  // Completed Test Result state for post-test analysis
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Handler to start any test
  const handleStartTest = (settings: TestSettings, title: string) => {
    let questions = generateTestQuestions(settings);
    // If test mode is mistake notebook or custom with limited questions
    if (questions.length === 0) {
      questions = generateTestQuestions({ ...settings, mode: 'full_mock', questionCount: 20 });
    }
    setActiveTest({
      title,
      settings,
      questions
    });
    setTestResult(null);
    setIsMockModalOpen(false);
  };

  // Launch Full Mock Test directly
  const handleLaunchFullMock = () => {
    setMockModalPreset('full_mock');
    setIsMockModalOpen(true);
  };

  // Launch Preset Mock
  const handleLaunchPresetMock = (preset: 'tcs_nqt' | 'gate_cs') => {
    setMockModalPreset(preset);
    setIsMockModalOpen(true);
  };

  // Subject quick handlers from dashboard
  const handleSubjectPractice = (subjId: SubjectId) => {
    setSelectedSubject(subjId);
    setActiveTab('practice');
  };

  const handleSubjectLearning = (subjId: SubjectId) => {
    setSelectedSubject(subjId);
    setActiveTab('learning');
  };

  const handleSubjectMock = (subjId: SubjectId) => {
    setSelectedSubject(subjId);
    setMockModalPreset('subject_mock');
    setIsMockModalOpen(true);
  };

  // If a mock test is currently active, render full-screen ActiveTest
  if (activeTest) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ActiveTest
            testTitle={activeTest.title}
            settings={activeTest.settings}
            initialQuestionStates={activeTest.questions}
            onFinishTest={res => {
              setActiveTest(null);
              setTestResult(res);
            }}
            onExitTest={() => {
              if (window.confirm('Are you sure you want to exit? Your test progress will be lost.')) {
                setActiveTest(null);
              }
            }}
            onOpenCalc={() => setIsCalcOpen(true)}
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
          />
        </div>
        <VirtualCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
        <ScratchpadModal isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
      </div>
    );
  }

  // If viewing a completed Test Result
  if (testResult) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar
          activeTab={activeTab}
          setActiveTab={tab => {
            setTestResult(null);
            setActiveTab(tab);
          }}
          onOpenCalc={() => setIsCalcOpen(!isCalcOpen)}
          onOpenScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TestAnalytics
            result={testResult}
            onRetake={() => {
              setTestResult(null);
              setIsMockModalOpen(true);
            }}
            onGoToDashboard={() => {
              setTestResult(null);
              setActiveTab('dashboard');
            }}
            onStudyTopic={subjId => {
              setTestResult(null);
              setSelectedSubject(subjId);
              setActiveTab('learning');
            }}
          />
        </main>
        <VirtualCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
        <ScratchpadModal isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCalc={() => setIsCalcOpen(!isCalcOpen)}
        onOpenScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onStartFullMock={handleLaunchFullMock}
            onStartPresetMock={handleLaunchPresetMock}
            onSelectSubjectPractice={handleSubjectPractice}
            onSelectSubjectLearning={handleSubjectLearning}
            onSelectSubjectMock={handleSubjectMock}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'learning' && (
          <LearningPortal initialSubject={selectedSubject} />
        )}

        {activeTab === 'practice' && (
          <QuestionBank initialSubject={selectedSubject} />
        )}

        {activeTab === 'mock' && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Exam-Simulation Mock Test Center
              </h1>
              <p className="text-sm text-slate-500">
                Experience realistic exam conditions with balanced question distributions, countdown timers, virtual calculators, and post-test focus area diagnostics.
              </p>
              <button
                onClick={() => {
                  setMockModalPreset('full_mock');
                  setIsMockModalOpen(true);
                }}
                className="mt-4 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition"
              >
                Configure New Mock Test
              </button>
            </div>
            <Dashboard
              onStartFullMock={handleLaunchFullMock}
              onStartPresetMock={handleLaunchPresetMock}
              onSelectSubjectPractice={handleSubjectPractice}
              onSelectSubjectLearning={handleSubjectLearning}
              onSelectSubjectMock={handleSubjectMock}
              onNavigateToTab={setActiveTab}
            />
          </div>
        )}

        {activeTab === 'flashcards' && (
          <FlashcardDeck />
        )}

        {activeTab === 'mistakes' && (
          <MistakeNotebook onStartMistakeTest={handleStartTest} />
        )}
      </main>

      {/* Floating Tools & Modals */}
      <MockSetupModal
        isOpen={isMockModalOpen}
        onClose={() => setIsMockModalOpen(false)}
        onStartTest={handleStartTest}
        initialSubject={selectedSubject}
        initialMode={mockModalPreset}
      />

      <VirtualCalculator
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <p>
          CoreCS Mastery • Curated for TCS NQT, Infosys, Wipro, Product Screening & GATE CS Candidates
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          630+ Curated Problems • 6 Core CS Subjects • 5 Themes • Offline LocalStorage Ready
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <MainApp />
      </ProgressProvider>
    </ThemeProvider>
  );
}
