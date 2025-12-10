// src/api/wordClusterApi.js
import httpClient from "./httpClient";

// 메모리 캐시: 페이지 새로고침 전까지 유지
const clusterCache = new Map();        // key: wordId(string) -> { similar, opposite }
const createPromiseCache = new Map();  // key: wordId(string) -> Promise<{ similar, opposite }>

/**
 * 원본 List<ClusterWord>를 UI에서 쓰기 좋은 구조로 변환
 */
const mapRawClusters = (raw) => {
  const grouped = {
    similar: [],
    opposite: [],
  };

  (raw || []).forEach((item) => {
    const related = item.relatedWord || {};

    const dto = {
      id: item.clusterWordId ?? item.id,
      centerWordId: item.centerWord?.wordId,
      wordId: related.wordId,
      text: related.word,
      meaning: related.meaning,
      level: related.level,
      score: item.score,
      type: item.type, // "synonym" | "antonym" | "similarity"
      inMyList: false,
    };

    if (item.type === "antonym") {
      grouped.opposite.push(dto);
    } else {
      // synonym + similarity 모두 유의어 그룹으로
      grouped.similar.push(dto);
    }
  });

  return grouped;
};

/**
 * 특정 중심 단어의 클러스터 조회
 * GET /api/cluster?wordId={wordId}
 *
 * - 기본적으로 캐시 사용해서 같은 단어에 대해 여러 번 호출해도
 *   서버로 재요청 안 가도록 처리
 */
export const getClustersByCenter = async (wordId, options = {}) => {
  if (!wordId) {
    throw new Error("getClustersByCenter: wordId가 필요합니다.");
  }

  const { useCache = true } = options;
  const key = String(wordId);

  if (useCache && clusterCache.has(key)) {
    return clusterCache.get(key);
  }

  const res = await httpClient.get("/api/cluster", {
    params: { wordId: key },
  });

  const grouped = mapRawClusters(res.data);
  clusterCache.set(key, grouped);
  return grouped;
};

/**
 * 클러스터 생성
 * POST /api/cluster/create?wordId={wordId}
 *
 * - 같은 wordId에 대해 생성 버튼을 여러 번 눌러도
 *   in-flight Promise 를 재사용해서 중복 호출 방지
 * - 생성이 끝나면 최신 데이터 조회 + 캐시 갱신
 */
export const createCluster = async (wordId) => {
  if (!wordId) {
    throw new Error("createCluster: wordId가 필요합니다.");
  }

  const key = String(wordId);

  // 이미 생성 중이면 기존 Promise 재사용
  if (createPromiseCache.has(key)) {
    return createPromiseCache.get(key);
  }

  const promise = (async () => {
    await httpClient.post("/api/cluster/create", null, {
      params: { wordId: key },
    });

    // 새로 생성된 클러스터 다시 조회 (캐시 무시)
    const grouped = await getClustersByCenter(key, { useCache: false });
    clusterCache.set(key, grouped);
    return grouped;
  })();

  createPromiseCache.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    createPromiseCache.delete(key);
  }
};

/**
 * 로그인 유저의 모든 클러스터 조회
 * GET /api/cluster/all
 */
export const getMyClusters = async () => {
  const res = await httpClient.get("/api/cluster/all");
  return res.data;
};

/**
 * 특정 중심 단어의 클러스터 삭제 (로그인 유저 기준)
 * DELETE /api/cluster?wordId={wordId}
 */
export const deleteClusterByCenter = async (wordId) => {
  if (!wordId) {
    throw new Error("deleteClusterByCenter: wordId가 필요합니다.");
  }

  const key = String(wordId);
  const res = await httpClient.delete("/api/cluster", {
    params: { wordId: key },
  });

  clusterCache.delete(key);
  return res.data;
};

/**
 * 로그인 유저의 모든 클러스터 삭제
 * DELETE /api/cluster/all
 */
export const deleteAllClusters = async () => {
  const res = await httpClient.delete("/api/cluster/all");
  clusterCache.clear();
  return res.data;
};
