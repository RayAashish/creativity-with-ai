import { Question, SubjectId, Difficulty, TestSettings, TestQuestionState } from '../types';
import { ALL_QUESTIONS, getQuestionsBySubject } from '../data/questions';
import { SUBJECTS } from '../data/subjects';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateTestQuestions(settings: TestSettings): TestQuestionState[] {
  let selectedQuestions: Question[] = [];

  if (settings.mode === 'full_mock' || settings.mode === 'tcs_nqt' || settings.mode === 'gate_cs') {
    // Equal distribution across all 6 subjects
    const allSubjectIds: SubjectId[] = SUBJECTS.map(s => s.id);
    const countPerSubject = Math.floor(settings.questionCount / allSubjectIds.length);
    const remainder = settings.questionCount % allSubjectIds.length;

    allSubjectIds.forEach((subjId, idx) => {
      let pool = getQuestionsBySubject(subjId);

      if (settings.mode === 'tcs_nqt') {
        // TCS NQT favors Easy and Medium, with strong Aptitude & DSA focus
        pool = pool.filter(q => q.difficulty !== 'hard' || q.examTags.includes('TCS NQT'));
      } else if (settings.mode === 'gate_cs') {
        // GATE favors Medium and Hard
        pool = pool.filter(q => q.difficulty === 'hard' || q.examTags.includes('GATE CS'));
      }

      // Shuffled pool
      const shuffled = shuffle(pool);
      const needed = countPerSubject + (idx < remainder ? 1 : 0);
      selectedQuestions.push(...shuffled.slice(0, needed));
    });
  } else if (settings.mode === 'subject_mock' && settings.subjectId) {
    let pool = getQuestionsBySubject(settings.subjectId);
    if (settings.difficulty && settings.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === settings.difficulty);
    }
    const shuffled = shuffle(pool);
    selectedQuestions = shuffled.slice(0, settings.questionCount);
  } else {
    // Custom mode
    let pool = settings.subjectId ? getQuestionsBySubject(settings.subjectId) : ALL_QUESTIONS;
    if (settings.difficulty && settings.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === settings.difficulty);
    }
    const shuffled = shuffle(pool);
    selectedQuestions = shuffled.slice(0, settings.questionCount);
  }

  // Shuffle the final selected questions so subjects are pleasantly interleaved
  const finalQuestions = shuffle(selectedQuestions);

  return finalQuestions.map(q => ({
    question: q,
    selectedAnswer: null,
    isMarkedForReview: false,
    timeSpentSeconds: 0
  }));
}
