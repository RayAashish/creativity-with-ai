import { Question, SubjectId, Difficulty, ExamTag } from '../../types';
import { DSA_QUESTIONS } from './dsaQuestions';
import { CN_QUESTIONS } from './cnQuestions';
import { OOPS_QUESTIONS } from './oopsQuestions';
import { DBMS_QUESTIONS } from './dbmsQuestions';
import { OS_QUESTIONS } from './osQuestions';
import { APTITUDE_QUESTIONS } from './aptitudeQuestions';

export const ALL_QUESTIONS: Question[] = [
  ...DSA_QUESTIONS,
  ...CN_QUESTIONS,
  ...OOPS_QUESTIONS,
  ...DBMS_QUESTIONS,
  ...OS_QUESTIONS,
  ...APTITUDE_QUESTIONS
];

export const getQuestionsBySubject = (subjectId: SubjectId): Question[] => {
  return ALL_QUESTIONS.filter(q => q.subject === subjectId);
};

export const getQuestionById = (id: string): Question | undefined => {
  return ALL_QUESTIONS.find(q => q.id === id);
};

export interface QuestionFilters {
  subjectId?: SubjectId | 'all';
  difficulty?: Difficulty | 'all';
  examTag?: ExamTag | 'all';
  searchQuery?: string;
  topic?: string | 'all';
}

export const filterQuestions = (filters: QuestionFilters): Question[] => {
  return ALL_QUESTIONS.filter(q => {
    if (filters.subjectId && filters.subjectId !== 'all' && q.subject !== filters.subjectId) {
      return false;
    }
    if (filters.difficulty && filters.difficulty !== 'all' && q.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.examTag && filters.examTag !== 'all' && !q.examTags.includes(filters.examTag)) {
      return false;
    }
    if (filters.topic && filters.topic !== 'all' && q.topic !== filters.topic) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const matchQ = q.question.toLowerCase().includes(query);
      const matchTopic = q.topic.toLowerCase().includes(query);
      const matchOpts = q.options.some(opt => opt.toLowerCase().includes(query));
      const matchExp = q.explanation.toLowerCase().includes(query);
      if (!matchQ && !matchTopic && !matchOpts && !matchExp) return false;
    }
    return true;
  });
};

export const getSubjectQuestionCount = (subjectId: SubjectId): number => {
  return getQuestionsBySubject(subjectId).length;
};

export const getSubjectStats = (subjectId: SubjectId) => {
  const qs = getQuestionsBySubject(subjectId);
  return {
    total: qs.length,
    easy: qs.filter(q => q.difficulty === 'easy').length,
    medium: qs.filter(q => q.difficulty === 'medium').length,
    hard: qs.filter(q => q.difficulty === 'hard').length
  };
};
