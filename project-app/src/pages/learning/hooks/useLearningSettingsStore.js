// src/pages/learning/hooks/useLearningSettingsStore.js
import { create } from "zustand";

const DEFAULT_QUESTION_COUNT = 10;
const DEFAULT_LEVEL = "All";
const DEFAULT_DOMAIN = "All";

export const useLearningSettingsStore = create((set) => ({
  // 공통 학습 옵션
  questionCount: DEFAULT_QUESTION_COUNT, // 문항 수
  level: DEFAULT_LEVEL,                  // 난이도: "All" | "1" | "2" | "3"
  domain: DEFAULT_DOMAIN,                // 분야: "All" | "Daily Life" ...

  // setter들
  setQuestionCount: (count) =>
    set(() => ({ questionCount: count })),

  setLevel: (level) =>
    set(() => ({ level })),

  setDomain: (domain) =>
    set(() => ({ domain })),

  // 전체 초기화
  resetAll: () =>
    set(() => ({
      questionCount: DEFAULT_QUESTION_COUNT,
      level: DEFAULT_LEVEL,
      domain: DEFAULT_DOMAIN,
    })),
}));
