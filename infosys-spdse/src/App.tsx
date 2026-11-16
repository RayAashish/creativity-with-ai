import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { ProblemModal } from './components/ProblemModal';
import { SupportModal } from './components/SupportModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BlueprintView } from './views/BlueprintView';
import { RoleTracksView } from './views/RoleTracksView';
import { PatternsView } from './views/PatternsView';
import { PYQAnalysisView } from './views/PYQAnalysisView';
import { PredictedSetsView } from './views/PredictedSetsView';
import { MockExamView } from './views/MockExamView';
import { PatternTrainerView } from './views/PatternTrainerView';
import { ToolkitView } from './views/ToolkitView';
import { MistakeLogView } from './views/MistakeLogView';
import { StudyPlanView } from './views/StudyPlanView';
import { InterviewModuleView } from './views/InterviewModuleView';

// Data imports
import { codeforcesProblems } from './data/problemsData';
import { pyqDatabase } from './data/pyqData';
import { predictedSets } from './data/predictedSetsData';
import { oralInterviewQuestions } from './data/interviewData';
import { Language, PatternId, CodeforcesProblem, PredictedSet } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    return (localStorage.getItem('spdse_pref_lang') as Language) || 'java';
  });
  const [targetRole, setTargetRole] = useState<string>(() => {
    return localStorage.getItem('spdse_target_role') || 'sp_l1';
  });
  const [isLast48Hours, setIsLast48Hours] = useState<boolean>(() => {
    return localStorage.getItem('spdse_last_48h') === 'true';
  });
  const [solvedProblems, setSolvedProblems] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('spdse_solved_problems');
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['cf-1352-c', 'cf-1324-d']; // Initial seed
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedProblemModal, setSelectedProblemModal] = useState<CodeforcesProblem | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | undefined>(undefined);
  const [activeMockSet, setActiveMockSet] = useState<PredictedSet | null>(null);

  // Persist language
  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem('spdse_pref_lang', lang);
  };

  // Persist target role
  const handleTargetRoleChange = (role: string) => {
    setTargetRole(role);
    localStorage.setItem('spdse_target_role', role);
  };

  // Toggle 48 hours mode
  const handleToggleLast48Hours = () => {
    const nextVal = !isLast48Hours;
    setIsLast48Hours(nextVal);
    localStorage.setItem('spdse_last_48h', String(nextVal));
  };

  // Toggle problem solved
  const handleToggleSolved = (problemId: string) => {
    let updated: string[];
    if (solvedProblems.includes(problemId)) {
      updated = solvedProblems.filter(id => id !== problemId);
    } else {
      updated = [...solvedProblems, problemId];
    }
    setSolvedProblems(updated);
    localStorage.setItem('spdse_solved_problems', JSON.stringify(updated));
  };

  const handleNavigate = (view: string, itemId?: string) => {
    setCurrentView(view);
    setFocusedItemId(itemId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchSetInMock = (set: PredictedSet) => {
    setActiveMockSet(set);
    setCurrentView('mock-exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-paper-900 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        isLast48Hours={isLast48Hours}
        onToggleLast48Hours={handleToggleLast48Hours}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        targetRole={targetRole}
        onTargetRoleChange={handleTargetRoleChange}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Left Sticky Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isLast48Hours={isLast48Hours}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          solvedCount={solvedProblems.length}
          totalTrackCount={codeforcesProblems.length}
          onOpenSupport={() => setIsSupportOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              targetRole={targetRole}
              onTargetRoleChange={handleTargetRoleChange}
              solvedProblems={solvedProblems}
              onOpenSupport={() => setIsSupportOpen(true)}
            />
          )}

          {currentView === 'blueprint' && <BlueprintView />}

          {currentView === 'role-tracks' && (
            <RoleTracksView
              selectedRole={targetRole}
              onRoleSelect={handleTargetRoleChange}
              solvedProblems={solvedProblems}
              onToggleSolved={handleToggleSolved}
              onViewProblemDetails={(prob) => setSelectedProblemModal(prob)}
            />
          )}

          {currentView === 'patterns' && (
            <PatternsView
              initialPattern={(focusedItemId as PatternId) || 'arrays_and_prefix_sums'}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              onViewProblemDetails={(prob) => setSelectedProblemModal(prob)}
            />
          )}

          {currentView === 'pyq' && (
            <PYQAnalysisView
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              focusedPYQId={focusedItemId}
            />
          )}

          {currentView === 'predicted-sets' && (
            <PredictedSetsView
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              onLaunchSetInMock={handleLaunchSetInMock}
              onViewProblemDetails={(prob) => setSelectedProblemModal(prob)}
              focusedSetId={focusedItemId}
            />
          )}

          {currentView === 'mock-exam' && (
            <MockExamView
              initialSet={activeMockSet}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          )}

          {currentView === 'trainer' && <PatternTrainerView />}

          {currentView === 'toolkit' && <ToolkitView />}

          {currentView === 'mistake-log' && <MistakeLogView />}

          {currentView === 'study-plan' && (
            <StudyPlanView
              targetRole={targetRole}
              onTargetRoleChange={handleTargetRoleChange}
              onViewProblemDetails={(prob) => setSelectedProblemModal(prob)}
              onNavigate={handleNavigate}
              onLaunchMockSet={handleLaunchSetInMock}
            />
          )}

          {currentView === 'interview' && (
            <InterviewModuleView focusedQuestionId={focusedItemId} />
          )}

        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        problems={codeforcesProblems}
        pyqs={pyqDatabase}
        predictedSets={predictedSets}
        interviewQA={oralInterviewQuestions}
        onSelectResult={(view, itemId) => handleNavigate(view, itemId)}
      />

      {/* Problem Solution Modal */}
      <ProblemModal
        problem={selectedProblemModal}
        onClose={() => setSelectedProblemModal(null)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        isSolved={selectedProblemModal ? solvedProblems.includes(selectedProblemModal.id) : false}
        onToggleSolved={handleToggleSolved}
      />

      {/* Buy Me a Coffee / Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Vercel Analytics */}
      <Analytics />

    </div>
  );
}

export default App;
