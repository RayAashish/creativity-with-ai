import React, { useState } from 'react';
import { SubjectId, LearningTopic } from '../../types';
import { SUBJECTS } from '../../data/subjects';
import { ALL_LEARNING_TOPICS, getLearningTopicsBySubject } from '../../data/learning';
import { TopicViewer } from './TopicViewer';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface LearningPortalProps {
  initialSubject?: SubjectId;
  initialTopicId?: string;
}

export const LearningPortal: React.FC<LearningPortalProps> = ({
  initialSubject = 'dsa',
  initialTopicId
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(initialSubject);
  const [searchQuery, setSearchQuery] = useState('');

  const subjectTopics = getLearningTopicsBySubject(selectedSubject);

  const [selectedTopic, setSelectedTopic] = useState<LearningTopic>(() => {
    if (initialTopicId) {
      const found = ALL_LEARNING_TOPICS.find(t => t.id === initialTopicId);
      if (found) return found;
    }
    return subjectTopics[0] || ALL_LEARNING_TOPICS[0];
  });

  const handleSelectSubject = (subjId: SubjectId) => {
    sounds.playClick();
    setSelectedSubject(subjId);
    const topics = getLearningTopicsBySubject(subjId);
    if (topics.length > 0) {
      setSelectedTopic(topics[0]);
    }
  };

  const filteredTopics = subjectTopics.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Interactive Learning Hub
          </h1>
          <p className="text-sm text-slate-500">
            In-depth conceptual study guides, complexity tables, interview traps, and quick quizzes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search concepts, topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Subject Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS.map(subj => {
          const active = selectedSubject === subj.id;
          return (
            <button
              key={subj.id}
              onClick={() => handleSelectSubject(subj.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                active
                  ? 'bg-indigo-600 text-white shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{subj.shortName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {getLearningTopicsBySubject(subj.id).length} topics
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split View: Sidebar + Topic Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Topic Navigator Sidebar */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2 sticky top-20 max-h-[80vh] overflow-y-auto">
          <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            {SUBJECTS.find(s => s.id === selectedSubject)?.name} Modules
          </div>

          {filteredTopics.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No topics match "{searchQuery}"
            </div>
          ) : (
            filteredTopics.map(t => {
              const active = selectedTopic?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTopic(t);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-sm font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5 font-medium">
                      {t.category}
                    </div>
                    <div className="text-xs sm:text-sm font-bold line-clamp-1">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{t.readTimeMinutes} min read</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${
                    active ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-400'
                  }`} />
                </button>
              );
            })
          )}
        </div>

        {/* Topic Content Pane */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {selectedTopic ? (
            <TopicViewer topic={selectedTopic} />
          ) : (
            <div className="py-20 text-center text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="font-semibold">Select a topic from the left sidebar to begin reading.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
