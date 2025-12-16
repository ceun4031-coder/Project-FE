// src/pages/words/WordDetailPage.jsx
import { ArrowLeft, BookOpen, CheckCircle, Star } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  addFavorite,
  getCompletedList,
  getFavoriteList,
  getWordDetail,
  removeFavorite,
} from "../../api/wordApi";
import { getStudyStatus } from "../../api/studyApi";
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
const CLUSTER_TIMEOUT_MS = 8000;

const withTimeout = (promise, ms = CLUSTER_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

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
const ClusterChip = React.memo(function ClusterChip({ item, onOpen }) {
  return (
    <button
      type="button"
      className={`word-chip ${item.inMyList ? "word-chip--selected" : "word-chip--unselected"}`}
      onClick={() => onOpen(item)}
      title="단어 상세로 이동"
    >
      <div className="chip-main">
        <div className="chip-header-row">
          <span className="chip-word">{item.text}</span>
          <span className="chip-meaning-inline" title={item.meaning || ""}>
            {item.meaning?.trim() ? item.meaning : "-"}
          </span>
        </div>
      </div>
    </button>
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

        const [detailRes, favoriteRes, studyRes] = await Promise.all([
          getWordDetail(id),
          getFavoriteList().catch(() => []),
          getStudyStatus(id).catch(() => ({ status: "none" })),
        ]);

        if (cancelled) return;

        const detail = detailRes || {};
        const wordId = Number(detail.wordId);

        const favoriteIds = new Set((favoriteRes || []).map((f) => Number(f.wordId)));
       
        setWord({
          ...detail,
          isFavorite: favoriteIds.has(wordId) || !!detail.isFavorite,
          isCompleted: isStudyCompleted(studyRes?.status),

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
  // ✅ 학습하고 뒤로 돌아왔을 때 완료 상태 재동기화
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const studyRes = await getStudyStatus(id).catch(() => ({ status: "none" }));
        if (cancelled) return;

        setWord((prev) =>
          prev ? { ...prev, isCompleted: isStudyCompleted(studyRes?.status) } : prev

        );
      } catch (e) {
        console.error("학습 상태 갱신 실패", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, location.key]);

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

        const grouped = await withTimeout(getClustersByCenter(centerId, { useCache }));

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
        setClusterError(
        e?.message === "timeout"
        ? "연관 단어 로딩이 지연되고 있어요. 다시 시도해 주세요."
       : "연관 단어를 불러오지 못했습니다."
      );
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

        const grouped = await withTimeout(createCluster(centerId));

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
        setClusterError(
        e?.message === "timeout"
          ? "연관 단어 생성이 지연되고 있어요. 잠시 후 다시 시도해 주세요."
          : "연관 단어 생성 중 오류가 발생했습니다."
        );
        setClusterStatus("error");
        return null;
      }
    },
    [id]
  );
  // 자동: GET -> empty면 POST
useEffect(() => {
  if (!id) return;

  let cancelled = false;

  const run = async () => {
    // 1) 캐시로 먼저 시도
    const grouped = await fetchClusters({ useCache: true, centerId: id });
    if (cancelled) return;

    // 캐시 실패(에러/timeout)면 no-cache로 한 번 더
    if (!grouped) {
      await fetchClusters({ useCache: false, centerId: id });
      return;
    }

    const empty =
      (grouped.similar?.length ?? 0) === 0 &&
      (grouped.opposite?.length ?? 0) === 0;

    if (!empty) return;

    // 2) 비어있으면 생성 (id당 1회만)
    if (autoCreateTriedRef.current.has(String(id))) return;
    autoCreateTriedRef.current.add(String(id));

    await runCreateCluster(id);
  };

  run();

  return () => {
    cancelled = true;
  };
}, [id, fetchClusters, runCreateCluster]);

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
  // ✅ 학습 완료 판정(백엔드가 learned/pending 등을 줄 수 있어서 보정)
const normalizeStudyStatus = (raw) =>
  String(raw ?? "none").trim().toLowerCase();

const isStudyCompleted = (rawStatus) => {
  const s = normalizeStudyStatus(rawStatus);
  return s === "correct" || s === "learned" || s === "completed" || s === "done";
};

  // ✅ 연관 단어 클릭 -> 상세 페이지 이동
  const handleOpenClusterWord = useCallback(
    (item) => {
      const targetId = item?.wordId ?? item?.id; // 서버 응답 필드에 맞게 유지
      if (targetId) {
        navigate(`/words/${targetId}`, {
          state: {
            from: "word-detail",
            search: location.state?.search || "",
          },
        });
        return;
      }

      // fallback: id가 없으면 검색으로 이동
      const text = String(item?.text || "").trim();
      if (text) navigate(`/words?search=${encodeURIComponent(text)}`);
    },
    [navigate, location.state]
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
                        </div>
                        <div className="chip-grid">
                          {viewSimilar.map((item) => (
                            <ClusterChip
                              key={item.wordId ?? item.id ?? item.text}
                              item={item}
                              onOpen={handleOpenClusterWord}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {(clusterTab === "전체" || clusterTab === "opposite") && (
                      <div className="cluster-group">
                        <div className="group-title-row">
                          <h4>반의어 (Opposite)</h4>
                        </div>
                        <div className="chip-grid">
                          {viewOpposite.map((item) => (
                            <ClusterChip
                              key={item.id ?? item.text}
                              item={item}
                             onOpen={handleOpenClusterWord}
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