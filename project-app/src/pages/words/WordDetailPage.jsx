// src/pages/words/WordDetailPage.jsx
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle,
  Plus,
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addFavorite,
  getCompletedList,
  getFavoriteList,
  getWordDetail,
  removeFavorite,
} from "../../api/wordApi";
import "./WordDetailPage.css";

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // --- 연관 단어 클러스터 상태 ---
  const [clusterTab, setClusterTab] = useState("전체");

  // (더미 데이터 등 기존 로직 유지...)
  const clusterData = {
    similar: [
      { text: "Drink", level: 1, inMyList: false },
      { text: "Beverage", level: 2, inMyList: false },
      { text: "Espresso", level: 3, inMyList: true },
    ],
    opposite: [
      { text: "Refuse", level: 3, inMyList: false },
      { text: "Reject", level: 2, inMyList: false },
    ],
  };

  const handleAddClusterWord = async (targetWord) => {
    try {
      alert(`${targetWord} 단어를 단어장에 추가했습니다!`);
    } catch (err) {
      console.error(err);
      alert("단어 추가 실패!");
    }
  };

  const handleAddAll = (group) => {
    clusterData[group].forEach((w) => {
      if (!w.inMyList) handleAddClusterWord(w.text);
    });
  };

  // (useEffect 데이터 로딩 로직 유지...)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchWord = async () => {
      try {
        setLoading(true);
        const [detailRes, favoriteRes, completedRes] = await Promise.all([
          getWordDetail(id),
          getFavoriteList().catch(() => []),
          getCompletedList().catch(() => []),
        ]);
        if (cancelled) return;

        const detail = detailRes || {};
        const wordId = Number(detail.wordId);
        const favoriteIds = new Set((favoriteRes || []).map((f) => Number(f.wordId)));
        const completedIds = new Set((completedRes || []).map((c) => Number(c.wordId)));

        const merged = {
          ...detail,
          isFavorite: favoriteIds.has(wordId) || !!detail.isFavorite,
          isCompleted: completedIds.has(wordId) || !!detail.isCompleted,
        };

        setWord(merged);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("단어 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWord();
    return () => { cancelled = true; };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    const wordId = Number(word.wordId);
    if (!wordId) return;

    setFavLoading(true);
    const current = !!word.isFavorite;
    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    try {
      if (current) await removeFavorite(wordId);
      else await addFavorite(wordId);
    } catch (e) {
      console.error("즐겨찾기 실패", e);
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) return <div className="detail-loading"><div className="spinner"></div></div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!word) return null;

  const {
    word: text,
    meaning,
    partOfSpeech,
    domain,
    category,
    level,
    exampleSentenceEn,
    exampleSentenceKo,
    isFavorite,
    isCompleted,
  } = word;

  const displayDomain = domain || category || "";
  const displayLevel = typeof level === "number" ? level : "-";

  return (
    <div className="page-container ">
      <div className="detail-page">
      {/* 1. 상단 네비게이션 */}
      <div className="detail-nav">
        <button onClick={handleBack} className="back-btn">
          <ArrowLeft size={18} />
          목록으로
        </button>
      </div>

      {/* 2. 메인 헤더 (타이틀 + 뜻 + 태그 + 액션) */}
      <header className="detail-header">
        <div className="header-top-row">
          <div className="header-content">
            {/* 단어 */}
            <h1 className="detail-word-title">{text}</h1>
            
            {/* [이동됨] 뜻 (Meaning) - 헤더에 배치 */}
            <p className="detail-meaning">{meaning}</p>

            {/* 태그 */}
            <div className="detail-tags-row">
              {typeof level === "number" && (
                <span className="tag tag-level">Lv.{displayLevel}</span>
              )}
              {partOfSpeech && (
                <span className="tag tag-pos">{partOfSpeech}</span>
              )}
              {displayDomain && (
                <span className="tag tag-domain">{displayDomain}</span>
              )}
            </div>
          </div>

          {/* 액션 버튼 (즐겨찾기) */}
          <div className="header-actions">
            <button
              type="button"
              className={`fav-action-btn ${isFavorite ? "active" : ""}`}
              onClick={handleToggleFavorite}
              disabled={favLoading}
              title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Star
                size={28}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="detail-separator" />

        {/* 상태 표시 */}
        <div className="header-status-row">
          <div className={`status-badge ${isCompleted ? "done" : "todo"}`}>
            <CheckCircle size={16} />
            {isCompleted ? "학습 완료" : "학습 예정"}
          </div>
        </div>
      </header>

      {/* 3. 본문 컨텐츠 (2단 그리드) */}
      <div className="detail-grid">
        {/* [왼쪽] 예문 (뜻 카드는 삭제됨) */}
        <div className="detail-left-col">
          <section className="detail-card example-section">
            <div className="card-label">
              <BookOpen size={16} /> 예문
            </div>
            {(exampleSentenceEn || exampleSentenceKo) ? (
              <div className="example-box">
                {exampleSentenceEn && (
                  <p className="example-en">{exampleSentenceEn}</p>
                )}
                {exampleSentenceKo && (
                  <p className="example-ko">{exampleSentenceKo}</p>
                )}
              </div>
            ) : (
              <p className="no-data-text">등록된 예문이 없습니다.</p>
            )}
          </section>
        </div>

        {/* [오른쪽] 연관 단어 (클러스터) */}
        <div className="detail-right-col">
          <section className="detail-card cluster-section">
            <div className="cluster-header">
              <h3>연관 단어</h3>
              <div className="cluster-tabs">
                {["전체", "similar", "opposite"].map((tab) => (
                  <button
                    key={tab}
                    className={`cluster-tab ${clusterTab === tab ? "active" : ""}`}
                    onClick={() => setClusterTab(tab)}
                  >
                    {tab === "전체"
                      ? "All"
                      : tab === "similar"
                      ? "유의어"
                      : "반의어"}
                  </button>
                ))}
              </div>
            </div>

            <div className="cluster-content">
              {/* (클러스터 내용 렌더링 로직 기존과 동일) */}
              {(clusterTab === "전체" || clusterTab === "similar") && (
                <div className="cluster-group">
                  <div className="group-title-row">
                    <h4>유의어 (Similar)</h4>
                    <button className="text-btn-small" onClick={() => handleAddAll("similar")}>
                      모두 추가
                    </button>
                  </div>
                  <div className="chip-grid">
                    {clusterData.similar.map((item) => (
                      <div className="word-chip" key={item.text}>
                        <div className="chip-info">
                          <span className="chip-word">{item.text}</span>
                          <span className="chip-lv">Lv.{item.level}</span>
                        </div>
                        {item.inMyList ? (
                          <span className="chip-check"><Check size={14} /></span>
                        ) : (
                          <button className="chip-add-btn" onClick={() => handleAddClusterWord(item.text)}>
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(clusterTab === "전체" || clusterTab === "opposite") && (
                <div className="cluster-group">
                  <div className="group-title-row">
                    <h4>반의어 (Opposite)</h4>
                    <button className="text-btn-small" onClick={() => handleAddAll("opposite")}>
                      모두 추가
                    </button>
                  </div>
                  <div className="chip-grid">
                    {clusterData.opposite.map((item) => (
                      <div className="word-chip" key={item.text}>
                        <div className="chip-info">
                          <span className="chip-word">{item.text}</span>
                          <span className="chip-lv">Lv.{item.level}</span>
                        </div>
                        {item.inMyList ? (
                          <span className="chip-check"><Check size={14} /></span>
                        ) : (
                          <button className="chip-add-btn" onClick={() => handleAddClusterWord(item.text)}>
                            <Plus size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div></div>
  );
}

export default WordDetailPage;