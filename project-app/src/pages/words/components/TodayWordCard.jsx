import { useEffect, useState } from "react";
import { getTodayWord } from "../../../api/wordApi";
import "./TodayWordCard.css";

export default function TodayWordCard() {
  const [word, setWord] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await getTodayWord(); // GET /api/words/today

        if (cancelled) return;

        // 혹시라도 배열로 올 경우 방어
        if (Array.isArray(data) && data.length > 0) {
          setWord(data[0]);
        } else if (data && typeof data === "object") {
          setWord(data);
        } else {
          setWord(null);
        }
      } catch (e) {
        console.error("[TodayWordCard] 오늘의 단어 로딩 실패", e);
        if (cancelled) return;
        setWord(null);
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
  const levelValue =
    typeof word.level === "number"
      ? word.level
      : typeof word.wordLevel === "number"
      ? word.wordLevel
      : null;
  const level = levelValue != null ? `Lv.${levelValue}` : null;

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
