import { TestQuestionState, TestResult, TestSettings, SubjectId, Difficulty } from '../types';
import { SUBJECTS } from '../data/subjects';

export function calculateTestResult(
  title: string,
  settings: TestSettings,
  questionStates: TestQuestionState[],
  totalTimeSeconds: number
): TestResult {
  const totalQuestions = questionStates.length;
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  const subjectBreakdown: Record<SubjectId, { total: number; correct: number; incorrect: number; unattempted: number }> = {
    dsa: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    cn: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    oops: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    dbms: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    os: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    aptitude: { total: 0, correct: 0, incorrect: 0, unattempted: 0 }
  };

  const difficultyBreakdown: Record<Difficulty, { total: number; correct: number; incorrect: number; unattempted: number }> = {
    easy: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    medium: { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    hard: { total: 0, correct: 0, incorrect: 0, unattempted: 0 }
  };

  const topicScores: Record<string, { subject: SubjectId; topic: string; total: number; correct: number }> = {};

  questionStates.forEach(qs => {
    const subj = qs.question.subject;
    const diff = qs.question.difficulty;
    const topic = qs.question.topic;

    subjectBreakdown[subj].total++;
    difficultyBreakdown[diff].total++;

    const topicKey = `${subj}:${topic}`;
    if (!topicScores[topicKey]) {
      topicScores[topicKey] = { subject: subj, topic, total: 0, correct: 0 };
    }
    topicScores[topicKey].total++;

    if (qs.selectedAnswer === null) {
      unattempted++;
      subjectBreakdown[subj].unattempted++;
      difficultyBreakdown[diff].unattempted++;
    } else {
      attempted++;
      if (qs.selectedAnswer === qs.question.correctAnswer) {
        correct++;
        subjectBreakdown[subj].correct++;
        difficultyBreakdown[diff].correct++;
        topicScores[topicKey].correct++;
      } else {
        incorrect++;
        subjectBreakdown[subj].incorrect++;
        difficultyBreakdown[diff].incorrect++;
      }
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  const score = correct;
  const maxScore = totalQuestions;

  // Generate actionable focus areas
  const focusAreas: { subject: SubjectId; topic: string; accuracy: number; advice: string }[] = [];

  // Evaluate subject-level focus
  SUBJECTS.forEach(subj => {
    const stat = subjectBreakdown[subj.id];
    if (stat.total > 0) {
      const subjAcc = (stat.correct / stat.total) * 100;
      if (subjAcc < 60) {
        focusAreas.push({
          subject: subj.id,
          topic: `${subj.name} Fundamentals`,
          accuracy: Math.round(subjAcc),
          advice: `Your accuracy in ${subj.name} is ${Math.round(subjAcc)}% (${stat.correct}/${stat.total}). Review core ${subj.shortName} cheat-sheets in the Learning Hub to solidify fundamental concepts.`
        });
      }
    }
  });

  // Evaluate granular topic-level focus
  Object.values(topicScores).forEach(ts => {
    if (ts.total >= 2) {
      const topicAcc = (ts.correct / ts.total) * 100;
      if (topicAcc < 50) {
        focusAreas.push({
          subject: ts.subject,
          topic: ts.topic,
          accuracy: Math.round(topicAcc),
          advice: `Struggled with ${ts.topic} (${ts.correct}/${ts.total} correct). Recommend revising key formulas and practicing medium-level problem sets.`
        });
      }
    }
  });

  // Sort focus areas with lowest accuracy first
  focusAreas.sort((a, b) => a.accuracy - b.accuracy);

  return {
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    date: new Date().toISOString(),
    testTitle: title,
    settings,
    totalQuestions,
    attempted,
    correct,
    incorrect,
    unattempted,
    score,
    maxScore,
    percentage,
    timeTakenSeconds: totalTimeSeconds,
    subjectBreakdown,
    difficultyBreakdown,
    focusAreas,
    questionStates
  };
}
