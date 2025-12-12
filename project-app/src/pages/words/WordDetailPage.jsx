// src/pages/words/WordDetailPage.jsx
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle,
  Plus,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  addFavorite,
  getCompletedList,
  getFavoriteList,
  getWordDetail,
  removeFavorite,
  addWordFromCluster,
} from "../../api/wordApi";
import { getClustersByCenter, createCluster } from "../../api/wordClusterApi";
import Button from "../../components/common/Button";
import "./WordDetailPage.css";

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 기본 단어 정보
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // 클러스터 상태
  const [clusterTab, setClusterTab] = useState("전체");
  const [clusterData, setClusterData] = useState({ similar: [], opposite: [] });
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterLoaded, setClusterLoaded] = useState(false); // 조회/생성 시도 여부
  const [clusterError, setClusterError] = useState(null);

  // 같은 id에 대해 자동 로딩 중복 방지
  const autoClusterLoadedRef = useRef(null);

  // ------------------------------------------------
  // 단어 상세 + 즐겨찾기/학습완료
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchBase = async () => {
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

        const favoriteIds = new Set(
          (favoriteRes || []).map((f) => Number(f.wordId))
        );
        const completedIds = new Set(
          (completedRes || []).map((c) => Number(c.wordId))
        );

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

    fetchBase();

    return () => {
      cancelled = true;
    };
  }, [id]);
// 즐겨찾기 캐시 데이터 낙관적 업데이트
  const queryClient = useQueryClient();
const WORDS_QUERY_KEY = ["words", "list"]; // WordListPage와 동일해야 함

  // ------------------------------------------------
  // 클러스터 조회 (실제 호출 함수)
  // - 페이지 진입 시 자동으로 실행되도록 아래 useEffect에서 호출
  // - 오래 걸려도 UI는 단어 상세부터 먼저 렌더링되도록 "idle/timeout"로 살짝 뒤에 붙임
  // ------------------------------------------------
  const fetchClusters = async ({ useCache = true } = {}) => {
    if (!id || clusterLoading) return;

    try {
      setClusterError(null);
      setClusterLoading(true);

      const grouped = await getClustersByCenter(id, { useCache });
      setClusterData({
        similar: grouped.similar || [],
        opposite: grouped.opposite || [],
      });
      setClusterLoaded(true);
    } catch (e) {
      console.error("연관 단어 로딩 실패", e);
      setClusterError("연관 단어를 불러오지 못했습니다.");
      setClusterLoaded(true); // '없음'과 구분하려면 error 상태를 별도로 봄
    } finally {
      setClusterLoading(false);
    }
  };

  // ------------------------------------------------
  // ✅ 페이지 진입 시 자동으로 클러스터 조회
  // - 단어 상세(loading=false) 이후에 실행해서 초기 체감 속도 우선
  // - 같은 id에 대해 재렌더링으로 중복 호출 방지
  // ------------------------------------------------
  useEffect(() => {
    if (!id) return;
    if (loading) return; // 상세 렌더 우선
    if (autoClusterLoadedRef.current === String(id)) return;

    autoClusterLoadedRef.current = String(id);

    // 새 단어로 이동 시 이전 데이터 잔상 방지
    setClusterData({ similar: [], opposite: [] });
    setClusterLoaded(false);
    setClusterError(null);

    let cancelled = false;
    let idleHandle = null;
    let timeoutHandle = null;

    const run = async () => {
      if (cancelled) return;
      await fetchClusters({ useCache: true });
    };

    // requestIdleCallback 지원 시: 브라우저가 한가할 때 실행
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      // 미지원 환경: 짧게 지연해서 첫 렌더 먼저 보여줌
      timeoutHandle = window.setTimeout(run, 150);
    }

    return () => {
      cancelled = true;
      if (idleHandle && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loading]);

  // ------------------------------------------------
  // 클러스터 생성: 서버에서 DeepSeek + 임베딩 계산
  // ------------------------------------------------
  const handleCreateCluster = async () => {
    if (!id || clusterLoading) return;

    try {
      setClusterError(null);
      setClusterLoading(true);

      const grouped = await createCluster(id); // 생성 + 최신 데이터 반환
      setClusterData({
        similar: grouped.similar || [],
        opposite: grouped.opposite || [],
      });
      setClusterLoaded(true);
    } catch (e) {
      console.error("연관 단어 생성 실패", e);
      setClusterError("연관 단어 생성 중 오류가 발생했습니다.");
      setClusterLoaded(true);
    } finally {
      setClusterLoading(false);
    }
  };

  // ------------------------------------------------
  // 즐겨찾기 토글
  // ------------------------------------------------
const handleToggleFavorite = async () => {
  if (!word || favLoading) return;
  const wordId = Number(word.wordId);
  if (!wordId) return;

  setFavLoading(true);
  const current = !!word.isFavorite;

  // ✅ WordDetail 낙관적 업데이트
  setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

  // ✅ WordList 캐시도 낙관적 업데이트 (캐시가 있을 때만)
  const previousWords = queryClient.getQueryData(WORDS_QUERY_KEY);
  if (previousWords) {
    queryClient.setQueryData(WORDS_QUERY_KEY, (old = []) =>
      old.map((w) =>
        Number(w.wordId) === wordId ? { ...w, isFavorite: !current } : w
      )
    );
  }

  try {
    if (current) await removeFavorite(wordId);
    else await addFavorite(wordId);

    // 서버와 동기화(백그라운드)
    queryClient.invalidateQueries({ queryKey: WORDS_QUERY_KEY });
  } catch (e) {
    console.error("즐겨찾기 실패", e);

    // 롤백
    setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
    if (previousWords) {
      queryClient.setQueryData(WORDS_QUERY_KEY, previousWords);
    }

    alert("오류가 발생했습니다.");
  } finally {
    setFavLoading(false);
  }
};


  // ------------------------------------------------
  // 연관 단어 → 단어장에 추가
  // ------------------------------------------------
  const handleAddClusterWord = async (targetWord, level = 1) => {
    try {
      await addWordFromCluster({ text: targetWord, level });

      setClusterData((prev) => {
        const updateGroup = (group) =>
          group.map((item) =>
            item.text === targetWord ? { ...item, inMyList: true } : item
          );

        return {
          ...prev,
          similar: updateGroup(prev.similar),
          opposite: updateGroup(prev.opposite),
        };
      });

      alert(`${targetWord} 단어를 단어장에 추가했습니다!`);
    } catch (err) {
      console.error("연관 단어 추가 실패", err);
      alert("단어 추가 실패!");
    }
  };

  const handleAddAll = (groupKey) => {
    const group = clusterData[groupKey];
    if (!group) return;

    group
      .filter((w) => !w.inMyList)
      .forEach((w) => {
        handleAddClusterWord(w.text, w.level);
      });
  };

  const handleBack = () => {
    const fromList = location.state?.from === "word-list";
    const search = location.state?.search || "";

    if (fromList) {
      navigate(`/words${search}`);
    } else {
      navigate("/words");
    }
  };

  // ------------------------------------------------
  // 로딩 / 에러 처리
  // ------------------------------------------------
  if (loading)
    return (
      <div className="detail-loading">
        <div className="spinner" />
      </div>
    );
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

  const hasAnyCluster =
    (clusterData.similar && clusterData.similar.length > 0) ||
    (clusterData.opposite && clusterData.opposite.length > 0);

  // ------------------------------------------------
  // 렌더링
  // ------------------------------------------------
  return (
    <div className="page-container">
      <div className="detail-page">
        {/* 상단 네비게이션 */}
        <div className="detail-nav">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={18} />
            <span className="back-label">목록으로</span>
          </button>
        </div>

        {/* 메인 헤더 */}
        <header className="detail-header">
          <div className="header-top-row">
            <div className="header-content">
              <h1 className="detail-word-title">{text}</h1>
              {meaning && <p className="detail-meaning">{meaning}</p>}
            </div>

            <button
              type="button"
              className={`fav-action-btn ${isFavorite ? "active" : ""}`}
              onClick={handleToggleFavorite}
              disabled={favLoading}
              title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Star
                size={26}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={1.6}
              />
            </button>
          </div>

          <div className="header-bottom-row">
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

            <div className={`status-badge ${isCompleted ? "done" : "todo"}`}>
              <CheckCircle size={16} />
              <span className="status-label">
                {isCompleted ? "학습 완료" : "학습 예정"}
              </span>
            </div>
          </div>
        </header>

        {/* 본문 2단 그리드 */}
        <div className="detail-grid">
          {/* 왼쪽: 예문 */}
          <div className="detail-left-col">
            <section className="detail-card example-section">
              <div className="card-label">
                <BookOpen size={16} />
                <span>예문</span>
              </div>
              {exampleSentenceEn || exampleSentenceKo ? (
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

          {/* 오른쪽: 연관 단어(클러스터) */}
          <div className="detail-right-col">
            <section className="detail-card cluster-section">
              <div className="cluster-header">
                <h3>연관 단어</h3>
                <div className="cluster-tabs">
                  {["전체", "similar", "opposite"].map((tab) => (
                    <button
                      key={tab}
                      className={`cluster-tab ${clusterTab === tab ? "active" : ""
                        }`}
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
                {/* 로딩 스피너 */}
                {clusterLoading && (
                  <div className="cluster-loading">
                    <div className="spinner small" />
                    <span>연관 단어를 불러오는 중입니다...</span>
                  </div>
                )}

                {/* 에러 */}
                {!clusterLoading && clusterLoaded && clusterError && (
                  <div className="cluster-empty-box">
                    <p className="no-data-text">{clusterError}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchClusters({ useCache: false })}
                    >
                      다시 시도
                    </Button>
                  </div>
                )}

                {/* 조회는 했는데 아무 것도 없을 때 → 생성 버튼 */}
                {!clusterLoading &&
                  clusterLoaded &&
                  !clusterError &&
                  !hasAnyCluster && (
                    <div className="cluster-empty-box">
                      <p className="no-data-text">
                        현재 저장된 연관 단어가 없습니다.
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCreateCluster}
                      >
                        연관 단어 생성하기
                      </Button>
                    </div>
                  )}

                {/* 클러스터가 있을 때 */}
                {!clusterLoading &&
                  clusterLoaded &&
                  !clusterError &&
                  hasAnyCluster && (
                    <>
                      {/* 유의어 */}
                      {(clusterTab === "전체" || clusterTab === "similar") && (
                        <div className="cluster-group">
                          <div className="group-title-row">
                            <h4>유의어 (Similar)</h4>
                            <button
                              className="text-btn-small"
                              onClick={() => handleAddAll("similar")}
                            >
                              모두 추가
                            </button>
                          </div>
                          <div className="chip-grid">
                            {clusterData.similar.map((item) => (
                              <div
                                className={`word-chip ${item.inMyList
                                    ? "word-chip--selected"
                                    : "word-chip--unselected"
                                  }`}
                                key={item.text}
                              >
                                <div className="chip-main">
                                  <div className="chip-header-row">
                                    <span className="chip-word">{item.text}</span>
                                    {item.meaning && (
                                      <span className="chip-meaning-inline">{item.meaning}</span>
                                    )}
                                  </div>

                                 
                                </div>

                                {item.inMyList ? (
                                  <span className="chip-check">
                                    <Check size={14} />
                                  </span>
                                ) : (
                                  <button
                                    className="chip-add-btn"
                                    onClick={() =>
                                      handleAddClusterWord(
                                        item.text,
                                        item.level
                                      )
                                    }
                                  >
                                    <Plus size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 반의어 */}
                      {(clusterTab === "전체" || clusterTab === "opposite") && (
                        <div className="cluster-group">
                          <div className="group-title-row">
                            <h4>반의어 (Opposite)</h4>
                            <button
                              className="text-btn-small"
                              onClick={() => handleAddAll("opposite")}
                            >
                              모두 추가
                            </button>
                          </div>
                          <div className="chip-grid">
                            {clusterData.opposite.map((item) => (
                              <div
                                className={`word-chip ${item.inMyList
                                    ? "word-chip--selected"
                                    : "word-chip--unselected"
                                  }`}
                                key={item.text}
                              >
                                <div className="chip-main">
                                  <div className="chip-header-row">
                                    <span className="chip-word">
                                      {item.text}
                                    </span>
                                    {typeof item.level === "number" && (
                                      <span
                                        className={`chip-lv chip-lv--${item.level}`}
                                      >
                                        Lv.{item.level}
                                      </span>
                                    )}
                                  </div>
                                  {item.meaning && (
                                    <p className="chip-meaning">
                                      {item.meaning}
                                    </p>
                                  )}
                                </div>

                                {item.inMyList ? (
                                  <span className="chip-check">
                                    <Check size={14} />
                                  </span>
                                ) : (
                                  <button
                                    className="chip-add-btn"
                                    onClick={() =>
                                      handleAddClusterWord(
                                        item.text,
                                        item.level
                                      )
                                    }
                                  >
                                    <Plus size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                {/* 아직 자동 로딩이 시작되기 전(극히 짧은 구간) */}
                {!clusterLoading && !clusterLoaded && (
                  <div className="cluster-loading">
                    <div className="spinner small" />
                    <span>연관 단어 준비 중...</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WordDetailPage;
