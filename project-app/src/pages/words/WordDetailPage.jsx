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

  // --- 연관 단어 클러스터 상태 (현재는 더미 데이터) ---
  const [clusterTab, setClusterTab] = useState("전체");

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

  // 클러스터 단어 추가 (향후 CLUSTER_WORD API로 교체 예정)
  const handleAddClusterWord = async (targetWord) => {
    try {
      alert(`${targetWord} 단어를 단어장에 추가했습니다!`);
      // TODO: 실제 API가 생기면 여기서 POST /api/words/cluster 등으로 연동
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

  // 단어 상세 조회
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchWord = async () => {
      try {
        setLoading(true);
        const data = await getWordDetail(id); // GET /api/words/detail/{id}
        if (cancelled) return;
        setWord(data);
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
    return () => {
      cancelled = true;
    };
  }, [id]);

  // 즐겨찾기 토글
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    setFavLoading(true);
    const current = word.isFavorite;

    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    try {
      current
        ? await removeFavorite(word.wordId) // DELETE /api/favorites/{wordId}
        : await addFavorite(word.wordId); // POST /api/favorites/{wordId}
    } catch (e) {
      console.error("즐겨찾기 실패", e);
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // 학습 상태 토글 (완료 처리)
const handleToggleProgress = async () => {
  if (!word || progressLoading) return;
  setProgressLoading(true);
  const current = word.isCompleted;

  setWord((prev) => (prev ? { ...prev, isCompleted: !current } : prev));

  try {
    await toggleProgress(word.wordId, current); // ← 여기
  } catch (e) {
    console.error("학습 상태 실패", e);
    setWord((prev) => (prev ? { ...prev, isCompleted: current } : prev));
    alert("오류가 발생했습니다.");
  } finally {
    setProgressLoading(false);
  }
};

  const handleBack = () => navigate(-1);

  if (loading) return <div className="detail-loading">로딩 중... ⏳</div>;
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
    <div className="detail-page-container">
      {/* 1. 상단 네비게이션 */}
      <div className="detail-nav">
        <button onClick={handleBack} className="back-btn">
          ← 목록으로
        </button>
      </div>

      {/* 2. 메인 헤더 카드 (단어 + 태그 + 액션) */}
      <section className="detail-header-card">
        <div className="header-left">
          <h1 className="detail-word">{text}</h1>
          <div className="detail-tags">
            {partOfSpeech && (
              <span className="tag tag-pos">{partOfSpeech}</span>
            )}
            {displayDomain && (
              <span className="tag tag-domain">{displayDomain}</span>
            )}
            <span className="tag tag-level">Lv.{displayLevel}</span>
          </div>
        </div>

        <div className="header-right">
          {/* 학습 상태 토글 버튼 */}
          <button
            className={`status-toggle-btn ${
              isCompleted ? "completed" : ""
            }`}
            onClick={handleToggleProgress}
            disabled={progressLoading}
          >
            {isCompleted ? "학습완료 취소" : "학습완료로 표시"}
          </button>

          {/* 즐겨찾기 별 */}
          <button
            className={`fav-star-btn ${isFavorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            disabled={favLoading}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      </section>

      {/* 3. 본문 레이아웃 */}
      <div className="detail-content-grid">
        {/* 좌측: 뜻 & 예문 */}
        <div className="detail-main-col">
          {/* 뜻 카드 */}
          <section className="content-card meaning-card">
            <h3 className="section-title">뜻</h3>
            <p className="meaning-text">{meaning}</p>
          </section>

          {/* 예문 카드 (DDL 기준: EXAMPLE_SENTENCE_EN / _KO) */}
          <section className="content-card example-card">
            <h3 className="section-title">예문</h3>

            {/* 1) API에서 내려온 예문 */}
            {(exampleSentenceEn || exampleSentenceKo) && (
              <div className="example-content">
                {exampleSentenceEn && (
                  <p className="example-en">• {exampleSentenceEn}</p>
                )}
                {exampleSentenceKo && (
                  <p className="example-ko">{exampleSentenceKo}</p>
                )}
              </div>
            )}

            {/* 2) 더미 예문 (예시용) */}
            <div className="example-content">
              <p className="example-en">
                • Would you like some coffee?
              </p>
              <p className="example-ko">커피 한 잔 드릴까요?</p>
            </div>
          </section>
        </div>

        {/* 우측: 연관 단어 클러스터 (더미) */}
        <div className="detail-side-col">
          <section className="content-card cluster-card">
            <div className="cluster-header">
              <h3 className="section-title">연관 단어 클러스터</h3>
              <div className="cluster-tabs">
                <span
                  className={`tab ${
                    clusterTab === "전체" ? "active" : ""
                  }`}
                  onClick={() => setClusterTab("전체")}
                >
                  전체
                </span>

                <span
                  className={`tab ${
                    clusterTab === "similar" ? "active" : ""
                  }`}
                  onClick={() => setClusterTab("similar")}
                >
                  의미 비슷
                </span>

                <span
                  className={`tab ${
                    clusterTab === "opposite" ? "active" : ""
                  }`}
                  onClick={() => setClusterTab("opposite")}
                >
                  반대 의미
                </span>
              </div>
            </div>

            {/* 그룹 1: 의미가 비슷한 단어 */}
            {(clusterTab === "전체" || clusterTab === "similar") && (
              <div className="cluster-group">
                <div className="group-header">
                  <h4>의미가 비슷한 단어</h4>
                  <span
                    className="add-all"
                    onClick={() => handleAddAll("similar")}
                  >
                    모두 추가 ▸
                  </span>
                </div>

                <p className="group-desc">
                  비슷한 의미로 같이 외우면 좋은 단어
                </p>

                <div className="chip-list">
                  {clusterData.similar.map((item) => (
                    <div className="word-chip" key={item.text}>
                      <span className="chip-text">{item.text}</span>
                      <span className="chip-level">
                        Lv.{item.level}
                      </span>

                      {item.inMyList ? (
                        <span className="chip-status">내 단어장</span>
                      ) : (
                        <span
                          className="chip-add"
                          onClick={() =>
                            handleAddClusterWord(item.text)
                          }
                        >
                          + 추가
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 그룹 2: 반대 의미 단어 */}
            {(clusterTab === "전체" || clusterTab === "opposite") && (
              <div className="cluster-group">
                <div className="group-header">
                  <h4>반대 의미 단어</h4>
                  <span
                    className="add-all"
                    onClick={() => handleAddAll("opposite")}
                  >
                    모두 추가 ▸
                  </span>
                </div>

                <p className="group-desc">
                  반대 의미로 함께 외우면 좋은 단어
                </p>

                <div className="chip-list">
                  {clusterData.opposite.map((item) => (
                    <div className="word-chip" key={item.text}>
                      <span className="chip-text">{item.text}</span>
                      <span className="chip-level">
                        Lv.{item.level}
                      </span>

                      {item.inMyList ? (
                        <span className="chip-status">내 단어장</span>
                      ) : (
                        <span
                          className="chip-add"
                          onClick={() =>
                            handleAddClusterWord(item.text)
                          }
                        >
                          + 추가
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default WordDetailPage;
