// src/pages/words/WordDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getWordDetail,
  addFavorite,
  removeFavorite,
  toggleProgress,
} from "../../api/wordApi";
import "./WordDetailPage.css";

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  // 단어 상세 로딩
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchWord = async () => {
      try {
        setLoading(true);
        const data = await getWordDetail(id); // ✅ word 객체 자체
        if (cancelled) return;
        setWord(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("단어 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWord();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 즐겨찾기 토글 (add/remove + 낙관적 업데이트)
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;

    setFavLoading(true);
    const current = word.isFavorite;

    // UI 먼저 토글
    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    try {
      if (current) {
        await removeFavorite(word.wordId);
      } else {
        await addFavorite(word.wordId);
      }
    } catch (e) {
      console.error("즐겨찾기 변경 실패", e);
      // 롤백
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      alert("즐겨찾기 변경 중 오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // 학습 상태 토글 (toggleProgress + 낙관적 업데이트)
  const handleToggleProgress = async () => {
    if (!word || progressLoading) return;

    setProgressLoading(true);
    const current = word.isCompleted;

    setWord((prev) => (prev ? { ...prev, isCompleted: !current } : prev));

    try {
      await toggleProgress(word.wordId);
    } catch (e) {
      console.error("학습 상태 변경 실패", e);
      setWord((prev) => (prev ? { ...prev, isCompleted: current } : prev));
      alert("학습 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setProgressLoading(false);
    }
  };

  const handleBack = () => {
    // 필요에 따라 "/words"로 고정해도 됨
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="detail-loading">
        단어를 불러오는 중입니다… ⏳
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error">
        <p>{error}</p>
        <button className="secondary-btn" onClick={handleBack}>
          목록으로
        </button>
      </div>
    );
  }

  if (!word) return null;

  const {
    word: text,
    meaning,
    partOfSpeech,
    category,
    level,
    exampleSentence,
    isFavorite,
    isCompleted,
  } = word;

  return (
    <div className="detail-container">
      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title-block">
            <h2>{text}</h2>
            <p className="detail-meaning">{meaning}</p>
          </div>

          <button
            type="button"
            className="fav-btn"
            onClick={handleToggleFavorite}
            disabled={favLoading}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            {isFavorite ? "⭐" : "☆"}
          </button>
        </div>

        <div className="detail-tags">
          <span className="tag">{partOfSpeech}</span>
          <span className="tag category">{category}</span>
          <span className="tag level">{`Lv.${level}`}</span>
        </div>

        <div className="detail-status-row">
          <span
            className={`status-pill ${
              isCompleted ? "status-done" : "status-pending"
            }`}
          >
            {isCompleted ? "학습 완료" : "학습 전"}
          </span>
        </div>

        <div className="example-box">
          <h4>EXAMPLE</h4>
          <p className="example-text">"{exampleSentence}"</p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="secondary-btn"
            onClick={handleBack}
          >
            목록으로
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleToggleProgress}
            disabled={progressLoading}
          >
            {isCompleted ? "학습 상태 되돌리기" : "학습 완료로 표시"}
          </button>
          {/* 추후 수정 기능 연결 시 사용 */}
          {/* <button className="edit-btn">수정하기</button> */}
        </div>
      </div>
    </div>
  );
}

export default WordDetailPage;
