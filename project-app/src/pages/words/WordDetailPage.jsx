// src/pages/words/WordDetailPage.jsx
import { ArrowLeft, BookOpen, Check, CheckCircle, Plus, Star } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getClustersByCenter, createCluster } from "@/api/wordClusterApi";
import Button from "@/components/common/Button";
import "./WordDetailPage.css";

const WORDS_QUERY_KEY = ["words", "list"];

// ================================
// 표시용 라벨(품사/분야) 변환 유틸
// ================================

const POS_TO_GROUP = {
  noun: "NOUN",

  verb: "VERB",
  "linking verb": "VERB",
  "modal verb": "VERB",

  adjective: "ADJ_ADV",
  adverb: "ADJ_ADV",

  pronoun: "FUNC",
  preposition: "FUNC",
  conjunction: "FUNC",
  determiner: "FUNC",
  "definite article": "FUNC",
  "indefinite article": "FUNC",
  "infinitive marker": "FUNC",

  number: "NUM",
  "ordinal number": "NUM",

  exclamation: "ETC",
};

const getPosGroup = (posRaw) => {
  const pos = String(posRaw ?? "").trim().toLowerCase();
  return POS_TO_GROUP[pos] ?? "ETC";
};

const POS_GROUP_LABEL = {
  NOUN: "명사",
  VERB: "동사",
  ADJ_ADV: "형용사·부사",
  FUNC: "기능어",
  NUM: "수·서수",
  ETC: "감탄·기타",
};

const getPosLabel = (posRaw) => POS_GROUP_LABEL[getPosGroup(posRaw)] ?? "감탄·기타";

const DOMAIN_LABEL = {
  "Daily Life": "일상생활",
  "People & Feelings": "사람/감정",
  Business: "직장/비즈니스",
  "School & Learning": "학교/학습",
  Travel: "여행/교통",
  "Food & Health": "음식/건강",
  Technology: "기술/IT",
};

const getDomainLabel = (v) => DOMAIN_LABEL[v] ?? v;

// ---- util: 병렬 제한 실행 ----
const runWithConcurrency = async (tasks, concurrency = 3) => {
  const results = [];
  let idx = 0;

  const worker = async () => {
    while (idx < tasks.length) {
      const cur = idx++;
      results[cur] = await tasks[cur]();
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
};

// ---- Chip 컴포넌트 (memo) ----
const ClusterChip = React.memo(function ClusterChip({ item, isPending, onAdd }) {
  return (
    <div
      className={`word-chip ${
        item.inMyList ? "word-chip--selected" : "word-chip--unselected"
      }`}
    >
      <div className="chip-main">
        <div className="chip-header-row">
          <span className="chip-word">{item.text}</span>
          <span className="chip-meaning-inline" title={item.meaning || ""}>
            {item.meaning?.trim() ? item.meaning : "-"}
          </span>
        </div>
      </div>

      {item.inMyList ? (
        <span className="chip-check">
          <Check size={14} />
        </span>
      ) : (
        <button
          className="chip-add-btn"
          onClick={() => onAdd(item.text)}
          disabled={isPending}
          title={isPending ? "추가 중..." : "단어장에 추가"}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
});

function WordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  const [clusterTab, setClusterTab] = useState("전체");
  const [clusterData, setClusterData] = useState({ similar: [], opposite: [] });
  const [clusterStatus, setClusterStatus] = useState("idle");
  const [clusterError, setClusterError] = useState(null);

  const autoClusterLoadedRef = useRef(null);
  const clusterReqSeqRef = useRef(0);
  const autoCreateTriedRef = useRef(new Set());

  // ✅ 추가 중 중복 클릭 방지 (text 기준)
  const [pendingAddSet, setPendingAddSet] = useState(() => new Set());

  const queryClient = useQueryClient();

  // ------------------------------
  // 단어 상세 로드
  // ------------------------------
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

        const favoriteIds = new Set((favoriteRes || []).map((f) => Number(f.wordId)));
        const completedIds = new Set((completedRes || []).map((c) => Number(c.wordId)));

        setWord({
          ...detail,
          isFavorite: favoriteIds.has(wordId) || !!detail.isFavorite,
          isCompleted: completedIds.has(wordId) || !!detail.isCompleted,
        });
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

  // ------------------------------
  // id 변경 시 클러스터 초기화
  // ------------------------------
  useEffect(() => {
    if (!id) return;

    clusterReqSeqRef.current += 1;

    setClusterData({ similar: [], opposite: [] });
    setClusterStatus("idle");
    setClusterError(null);

    autoClusterLoadedRef.current = null;

    // ✅ pending도 초기화
    setPendingAddSet(new Set());
  }, [id]);

  // ------------------------------
  // 클러스터 조회
  // ------------------------------
  const fetchClusters = useCallback(
    async ({ useCache = true, centerId = id } = {}) => {
      if (!centerId) return null;

      const mySeq = ++clusterReqSeqRef.current;

      try {
        setClusterError(null);
        setClusterStatus("loading");

        const grouped = await getClustersByCenter(centerId, { useCache });

        if (mySeq !== clusterReqSeqRef.current) return null;
        if (String(centerId) !== String(id)) return null;

        setClusterData({
          similar: grouped?.similar || [],
          opposite: grouped?.opposite || [],
        });

        setClusterStatus("ready");
        return grouped;
      } catch (e) {
        if (mySeq !== clusterReqSeqRef.current) return null;
        if (String(centerId) !== String(id)) return null;

        console.error("연관 단어 로딩 실패", e);
        setClusterError("연관 단어를 불러오지 못했습니다.");
        setClusterStatus("error");
        return null;
      }
    },
    [id]
  );

  // ------------------------------
  // 클러스터 생성
  // ------------------------------
  const runCreateCluster = useCallback(
    async (centerId = id) => {
      if (!centerId) return null;

      const mySeq = ++clusterReqSeqRef.current;

      try {
        setClusterError(null);
        setClusterStatus("creating");

        const grouped = await createCluster(centerId);

        if (mySeq !== clusterReqSeqRef.current) return null;
        if (String(centerId) !== String(id)) return null;

        setClusterData({
          similar: grouped?.similar || [],
          opposite: grouped?.opposite || [],
        });

        setClusterStatus("ready");
        return grouped;
      } catch (e) {
        if (mySeq !== clusterReqSeqRef.current) return null;

        console.error("연관 단어 생성 실패", e);
        setClusterError("연관 단어 생성 중 오류가 발생했습니다.");
        setClusterStatus("error");
        return null;
      }
    },
    [id]
  );

  // ------------------------------
  // 자동: GET -> empty면 POST
  // ------------------------------
  useEffect(() => {
    if (!id) return;
    if (loading) return;

    if (autoClusterLoadedRef.current === String(id)) return;
    autoClusterLoadedRef.current = String(id);

    let cancelled = false;
    let idleHandle = null;
    let timeoutHandle = null;

    const run = async () => {
      if (cancelled) return;

      const grouped = await fetchClusters({ useCache: true, centerId: id });
      if (!grouped) return;

      const empty =
        (grouped.similar?.length ?? 0) === 0 && (grouped.opposite?.length ?? 0) === 0;

      if (!empty) return;

      if (autoCreateTriedRef.current.has(String(id))) return;
      autoCreateTriedRef.current.add(String(id));

      await runCreateCluster(id);
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timeoutHandle = window.setTimeout(run, 150);
    }

    return () => {
      cancelled = true;
      if (idleHandle && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) window.clearTimeout(timeoutHandle);
    };
  }, [id, loading, fetchClusters, runCreateCluster]);

  // ------------------------------
  // 즐겨찾기 토글
  // ------------------------------
  const handleToggleFavorite = async () => {
    if (!word || favLoading) return;
    const wordId = Number(word.wordId);
    if (!wordId) return;

    setFavLoading(true);
    const current = !!word.isFavorite;

    setWord((prev) => (prev ? { ...prev, isFavorite: !current } : prev));

    const previousWords = queryClient.getQueryData(WORDS_QUERY_KEY);
    if (previousWords) {
      queryClient.setQueryData(WORDS_QUERY_KEY, (old = []) =>
        old.map((w) => (Number(w.wordId) === wordId ? { ...w, isFavorite: !current } : w))
      );
    }

    try {
      if (current) await removeFavorite(wordId);
      else await addFavorite(wordId);

      queryClient.invalidateQueries({ queryKey: WORDS_QUERY_KEY });
    } catch (e) {
      console.error("즐겨찾기 실패", e);
      setWord((prev) => (prev ? { ...prev, isFavorite: current } : prev));
      if (previousWords) queryClient.setQueryData(WORDS_QUERY_KEY, previousWords);
      alert("오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  // ------------------------------
  // 연관 단어 추가
  // - text만 받음
  // - pending set으로 중복 클릭 방지
  // ------------------------------
  const handleAddClusterWord = useCallback(async (targetWord) => {
    const key = String(targetWord || "").trim();
    if (!key) return;

    let shouldRun = false;

    setPendingAddSet((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      shouldRun = true;
      return next;
    });

    if (!shouldRun) return;

    try {
      await addWordFromCluster({ text: key });

      setClusterData((prev) => {
        const mark = (group) =>
          (group || []).map((item) =>
            String(item.text) === key ? { ...item, inMyList: true } : item
          );
        return { ...prev, similar: mark(prev.similar), opposite: mark(prev.opposite) };
      });
    } catch (err) {
      console.error("연관 단어 추가 실패", err);
      alert("단어 추가 실패!");
    } finally {
      setPendingAddSet((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  // 모두 추가: 병렬 제한(3개씩)
  const handleAddAll = useCallback(
    async (groupKey) => {
      const group = clusterData[groupKey];
      if (!group?.length) return;

      const targets = group.filter((w) => !w.inMyList).map((w) => w.text);
      const tasks = targets.map((t) => () => handleAddClusterWord(t));
      await runWithConcurrency(tasks, 3);
    },
    [clusterData, handleAddClusterWord]
  );

  const handleBack = () => {
    const fromList = location.state?.from === "word-list";
    const search = location.state?.search || "";
    if (fromList) navigate(`/words${search}`);
    else navigate("/words");
  };

  const hasAnyCluster =
    (clusterData.similar?.length ?? 0) > 0 || (clusterData.opposite?.length ?? 0) > 0;

  const viewSimilar = useMemo(
    () => (clusterTab === "전체" || clusterTab === "similar" ? clusterData.similar : []),
    [clusterTab, clusterData.similar]
  );
  const viewOpposite = useMemo(
    () => (clusterTab === "전체" || clusterTab === "opposite" ? clusterData.opposite : []),
    [clusterTab, clusterData.opposite]
  );

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

  return (
    <div className="page-container">
      <div className="detail-page">
        <div className="detail-nav">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={18} />
            <span className="back-label">목록으로</span>
          </button>
        </div>

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
              <Star size={26} fill={isFavorite ? "currentColor" : "none"} strokeWidth={1.6} />
            </button>
          </div>

          <div className="header-bottom-row">
            <div className="detail-tags-row">
              {typeof level === "number" && <span className="tag tag-level">Lv.{displayLevel}</span>}
              {partOfSpeech && <span className="tag tag-pos">{getPosLabel(partOfSpeech)}</span>}
              {displayDomain && <span className="tag tag-domain">{getDomainLabel(displayDomain)}</span>}
            </div>

            <div className={`status-badge ${isCompleted ? "done" : "todo"}`}>
              <CheckCircle size={16} />
              <span className="status-label">{isCompleted ? "학습 완료" : "학습 예정"}</span>
            </div>
          </div>
        </header>

        <div className="detail-grid">
          <div className="detail-left-col">
            <section className="detail-card example-section">
              <div className="card-label">
                <BookOpen size={16} />
                <span>예문</span>
              </div>
              {exampleSentenceEn || exampleSentenceKo ? (
                <div className="example-box">
                  {exampleSentenceEn && <p className="example-en">{exampleSentenceEn}</p>}
                  {exampleSentenceKo && <p className="example-ko">{exampleSentenceKo}</p>}
                </div>
              ) : (
                <p className="no-data-text">등록된 예문이 없습니다.</p>
              )}
            </section>
          </div>

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
                      {tab === "전체" ? "All" : tab === "similar" ? "유의어" : "반의어"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cluster-content">
                {(clusterStatus === "loading" || clusterStatus === "creating") && (
                  <div className="cluster-loading">
                    <div className="spinner small" />
                    <span>
                      {clusterStatus === "creating"
                        ? "연관 단어를 생성하는 중입니다..."
                        : "연관 단어를 불러오는 중입니다..."}
                    </span>
                  </div>
                )}

                {clusterStatus === "error" && (
                  <div className="cluster-empty-box">
                    <p className="no-data-text">{clusterError || "오류가 발생했습니다."}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchClusters({ useCache: false, centerId: id })}
                    >
                      다시 시도
                    </Button>
                  </div>
                )}

                {clusterStatus === "ready" && !hasAnyCluster && (
                  <div className="cluster-empty-box">
                    <p className="no-data-text">연관 단어가 없습니다.</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchClusters({ useCache: false, centerId: id })}
                    >
                      새로고침
                    </Button>
                  </div>
                )}

                {clusterStatus === "ready" && hasAnyCluster && (
                  <>
                    {(clusterTab === "전체" || clusterTab === "similar") && (
                      <div className="cluster-group">
                        <div className="group-title-row">
                          <h4>유의어 (Similar)</h4>
                          <button className="text-btn-small" onClick={() => handleAddAll("similar")}>
                            모두 추가
                          </button>
                        </div>
                        <div className="chip-grid">
                          {viewSimilar.map((item) => (
                            <ClusterChip
                              key={item.id ?? item.text}
                              item={item}
                              isPending={pendingAddSet.has(String(item.text))}
                              onAdd={handleAddClusterWord}
                            />
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
                          {viewOpposite.map((item) => (
                            <ClusterChip
                              key={item.id ?? item.text}
                              item={item}
                              isPending={pendingAddSet.has(String(item.text))}
                              onAdd={handleAddClusterWord}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {clusterStatus === "idle" && (
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
