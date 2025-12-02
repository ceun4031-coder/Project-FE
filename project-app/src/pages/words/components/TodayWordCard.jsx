import { useEffect, useState } from "react";
import { getTodayWords } from "../../../api/wordApi";
import "./TodayWordCard.css";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const FALLBACK_WORDS = [
  { word: "Serendipity", meaning: "뜻밖의 행운" },
  { word: "Momentum", meaning: "추진력, 운동량" },
  { word: "Illuminate", meaning: "밝히다, 분명히 하다" },
  { word: "Resilient", meaning: "회복력 있는" },
  { word: "Curiosity", meaning: "호기심" },
  { word: "Clarity", meaning: "명확함" },
  { word: "Gratitude", meaning: "감사함" },
];

function getRandomFallbackWord() {
  const today = new Date().toDateString();
  const seed = today.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return FALLBACK_WORDS[seed % FALLBACK_WORDS.length];
}

export default function TodayWordCard() {
  const [word, setWord] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 1) 프론트 MOCK 모드: 그냥 로컬 FALLBACK 사용
      if (USE_MOCK) {
        if (!cancelled) {
          setWord(getRandomFallbackWord());
        }
        return;
      }

      // 2) REAL 모드: 백엔드 Today Word API 사용
      try {
        const data = await getTodayWords(); // GET /api/words/today

        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          setWord(data[0]);
        } else if (data && typeof data === "object") {
          setWord(data);
        } else {
          setWord(getRandomFallbackWord());
        }
      } catch (e) {
        console.error("[TodayWordCard] 오늘의 단어 로딩 실패", e);
        if (cancelled) return;
        setWord(getRandomFallbackWord());
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!word) return null;

  const title = word.word || "";
  const meaning = word.meaning || "";
  const level =
    typeof word.wordLevel === "number" ? `Lv.${word.wordLevel}` : null;

  return (
    <div className="today-word-wrapper fade-in-up">
      <div className="today-word-card">
        <div className="today-word-tag">오늘의 단어</div>

        <p className="today-word-label">TODAY&apos;S WORD</p>
        <p className="today-word-text">{title}</p>
        {level && <p className="today-word-level">{level}</p>}
        <p className="today-word-meaning">{meaning}</p>
      </div>
    </div>
  );
}
