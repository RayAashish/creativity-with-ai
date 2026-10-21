import React, { useState, useMemo } from 'react';
import { SubjectId, Difficulty, ExamTag } from '../../types';
import { SUBJECTS } from '../../data/subjects';
import { filterQuestions, ALL_QUESTIONS } from '../../data/questions';
import { QuestionCard } from './QuestionCard';
import { useProgress } from '../../context/ProgressContext';
import { Search, Filter, Bookmark, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface QuestionBankProps {
  initialSubject?: SubjectId | 'all';
}

const ITEMS_PER_PAGE = 15;

export const QuestionBank: React.FC<QuestionBankProps> = ({ initialSubject = 'all' }) => {
  const { progress } = useProgress();

  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>(initialSubject);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [examFilter, setExamFilter] = useState<ExamTag | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredQuestions = useMemo(() => {
    let result = filterQuestions({
      subjectId: subjectFilter,
      difficulty: difficultyFilter,
      examTag: examFilter,
      searchQuery
    });

    if (bookmarkedOnly) {
      result = result.filter(q => progress.bookmarks.includes(q.id));
    }

    return result;
  }, [subjectFilter, difficultyFilter, examFilter, searchQuery, bookmarkedOnly, progress.bookmarks]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE) || 1;
  const currentQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const handleResetFilters = () => {
    sounds.playClick();
    setSubjectFilter('all');
    setDifficultyFilter('all');
    setExamFilter('all');
    setSearchQuery('');
    setBookmarkedOnly(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    sounds.playClick();
    setCurrentPage(newPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Question Bank
          </h1>
          <p className="text-sm text-slate-500">
            Over {ALL_QUESTIONS.length} curated questions with step-by-step solutions, key formulas, and exam tags.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, formulas..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Subject Pills */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Subject Filter
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                sounds.playClick();
                setSubjectFilter('all');
                setCurrentPage(1);
              }}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                subjectFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Subjects ({ALL_QUESTIONS.length})
            </button>
            {SUBJECTS.map(subj => {
              const active = subjectFilter === subj.id;
              return (
                <button
                  key={subj.id}
                  onClick={() => {
                    sounds.playClick();
                    setSubjectFilter(subj.id);
                    setCurrentPage(1);
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {subj.shortName} (105)
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Row: Difficulty + Exam Tags + Bookmarked */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Level:</span>
            <select
              value={difficultyFilter}
              onChange={e => {
                sounds.playClick();
                setDifficultyFilter(e.target.value as Difficulty | 'all');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (Concept Clearing)</option>
              <option value="medium">Medium (TCS NQT / Placements)</option>
              <option value="hard">Hard (GATE Level)</option>
            </select>
          </div>

          {/* Exam Tag Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Exam:</span>
            <select
              value={examFilter}
              onChange={e => {
                sounds.playClick();
                setExamFilter(e.target.value as ExamTag | 'all');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Exams</option>
              <option value="TCS NQT">TCS NQT</option>
              <option value="GATE CS">GATE CS</option>
              <option value="Campus Placement">Campus Placement</option>
              <option value="Product / MAANG">Product / MAANG</option>
              <option value="Fundamentals">Fundamentals</option>
            </select>
          </div>

          {/* Bookmark Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setBookmarkedOnly(!bookmarkedOnly);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition border ${
              bookmarkedOnly
                ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-current' : ''}`} />
            <span>Bookmarked ({progress.bookmarks.length})</span>
          </button>

          {/* Reset button */}
          {(subjectFilter !== 'all' || difficultyFilter !== 'all' || examFilter !== 'all' || searchQuery || bookmarkedOnly) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
        <span>
          Showing <strong>{filteredQuestions.length}</strong> matching questions
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Questions List */}
      {currentQuestions.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No questions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, difficulty filter, or reset your search options.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={(currentPage - 1) * ITEMS_PER_PAGE + idx}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-3">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
