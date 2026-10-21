import { LearningTopic, SubjectId } from '../../types';
import { DSA_LEARNING_TOPICS } from './dsaLearning';
import { CN_LEARNING_TOPICS } from './cnLearning';
import { OOPS_LEARNING_TOPICS } from './oopsLearning';
import { DBMS_LEARNING_TOPICS } from './dbmsLearning';
import { OS_LEARNING_TOPICS } from './osLearning';
import { APTITUDE_LEARNING_TOPICS } from './aptitudeLearning';

export const ALL_LEARNING_TOPICS: LearningTopic[] = [
  ...DSA_LEARNING_TOPICS,
  ...CN_LEARNING_TOPICS,
  ...OOPS_LEARNING_TOPICS,
  ...DBMS_LEARNING_TOPICS,
  ...OS_LEARNING_TOPICS,
  ...APTITUDE_LEARNING_TOPICS,
];

export const getLearningTopicsBySubject = (subjectId: SubjectId): LearningTopic[] => {
  return ALL_LEARNING_TOPICS.filter(t => t.subject === subjectId);
};

export const getLearningTopicById = (topicId: string): LearningTopic | undefined => {
  return ALL_LEARNING_TOPICS.find(t => t.id === topicId);
};
