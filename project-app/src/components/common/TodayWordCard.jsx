import { useEffect, useState } from "react";
import "../../styles/ui/todayWord.css";

const WORDS = [
  { word: "Serendipity", meaning: "뜻밖의 행운" },
  { word: "Momentum", meaning: "추진력, 운동량" },
  { word: "Illuminate", meaning: "밝히다, 분명히 하다" },
  { word: "Resilient", meaning: "회복력 있는" },
  { word: "Curiosity", meaning: "호기심" },
  { word: "Clarity", meaning: "명확함" },
  { word: "Gratitude", meaning: "감사함" },
];

function getRandomWordForToday() {
  const today = new Date().toDateString();
  const seed = today.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return WORDS[seed % WORDS.length];
}

export default function TodayWordCard() {
  const [word, setWord] = useState(null);

  useEffect(() => {
    setWord(getRandomWordForToday());
  }, []);

  if (!word) return null;

  return (
    <div className="today-word-wrapper fade-in-up">
      <div className="today-word-card">
        <div className="today-word-tag">오늘의 단어</div>

        <p className="today-word-label">TODAY'S WORD</p>
        <p className="today-word-text">{word.word}</p>
        <p className="today-word-meaning">{word.meaning}</p>
      </div>
    </div>
  );
}
