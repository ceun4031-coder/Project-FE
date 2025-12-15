// src/api/wordClusterApi.js
import httpClient from "./httpClient";

/**
 * Word Cluster API (연관 단어)
 *
 * 사용처(WordDetailPage) 요구사항
 * - getClustersByCenter(wordId, { useCache }) -> { similar: [], opposite: [] }
 * - createCluster(wordId) -> { similar: [], opposite: [] }
 * - UI에서 item.text / item.meaning / item.level / item.inMyList 사용
 *
 * 캐시 정책
 * - 메모리 캐시(새로고침 전까지 유지)
 * - 동일 wordId 중복 생성 방지: in-flight Promise 재사용
 */

// 메모리 캐시: key=wordId(string) -> grouped
const clusterCache = new Map();
// 생성 중복 방지: key=wordId(string) -> Promise<grouped>
const createPromiseCache = new Map();

/** sleep */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 빈 grouped 판정 */
const isEmptyGrouped = (g) =>
  !g ||
  ((g.similar?.length ?? 0) === 0 && (g.opposite?.length ?? 0) === 0);

/**
 * grouped 표준 형태 보장
 * - 서버가 grouped를 그대로 주거나, { data: grouped }로 감싸거나,
 *   기타 형태면 null 반환
 */
const normalizeGrouped = (data) => {
  if (!data || typeof data !== "object") return null;

  // grouped 직접
  if ("similar" in data || "opposite" in data) {
    return {
      similar: Array.isArray(data.similar) ? data.similar : [],
      opposite: Array.isArray(data.opposite) ? data.opposite : [],
    };
  }

  // { data: grouped } 형태
  if (data.data && typeof data.data === "object") {
    const d = data.data;
    if ("similar" in d || "opposite" in d) {
      return {
        similar: Array.isArray(d.similar) ? d.similar : [],
        opposite: Array.isArray(d.opposite) ? d.opposite : [],
      };
    }
  }

  return null;
};

/**
 * List<ClusterWord> 또는 유사 구조를 grouped로 매핑
 * - 백엔드 엔티티 기준: relationType (RELATION_TYPE)
 * - text 없으면 UI 렌더에서 깨지므로 제외
 */
const mapRawClusters = (raw) => {
  const grouped = { similar: [], opposite: [] };

  (raw || []).forEach((item) => {
    const related =
      (item?.relatedWord && typeof item.relatedWord === "object" && item.relatedWord) ||
      (item?.related && typeof item.related === "object" && item.related) ||
      (item?.relatedWordDto &&
        typeof item.relatedWordDto === "object" &&
        item.relatedWordDto) ||
      {};

    const center =
      (item?.centerWord && typeof item.centerWord === "object" && item.centerWord) ||
      (item?.center && typeof item.center === "object" && item.center) ||
      (item?.word && typeof item.word === "object" && item.word) ||
      {};

    // ✅ 핵심: relationType 우선
    const typeRaw = item?.relationType ?? item?.type ?? item?.relation ?? item?.relation_type;
    const type = typeof typeRaw === "string" ? typeRaw.trim().toLowerCase() : "";

    const text = related?.word ?? related?.text ?? related?.name;
    if (!text) return;

    const centerWordId = center?.wordId ?? item?.centerWordId ?? item?.wordId;
    const relatedWordId = related?.wordId ?? item?.relatedWordId;

    const dto = {
      id:
        item?.clusterId ?? // 엔티티: clusterId
        item?.clusterWordId ??
        item?.id ??
        `${centerWordId ?? ""}-${relatedWordId ?? text}`,
      centerWordId,
      wordId: relatedWordId,
      text,
      meaning: related?.meaning ?? related?.definition,
      level:
        typeof related?.level === "number"
          ? related.level
          : typeof item?.level === "number"
          ? item.level
          : undefined,
      score: item?.score,
      type, // "synonym" | "antonym" | "similarity" ...
      inMyList: !!(item?.inMyList || related?.inMyList),
    };

    // ✅ antonym만 opposite로, 나머지는 similar
    if (type === "antonym" || type === "opposite") grouped.opposite.push(dto);
    else grouped.similar.push(dto);
  });

  return grouped;
};

/**
 * 특정 중심 단어의 클러스터 조회
 * GET /api/cluster?wordId={wordId}
 */
export const getClustersByCenter = async (wordId, options = {}) => {
  if (!wordId) throw new Error("getClustersByCenter: wordId가 필요합니다.");

  const { useCache = true } = options;
  const key = String(wordId);

  if (useCache && clusterCache.has(key)) return clusterCache.get(key);

  const res = await httpClient.get("/api/cluster", { params: { wordId: key } });

  const groupedDirect = normalizeGrouped(res?.data);
  const grouped = groupedDirect ?? mapRawClusters(res?.data);

  clusterCache.set(key, grouped);
  return grouped;
};

/**
 * 클러스터 생성
 * POST /api/cluster/create?wordId={wordId}
 *
 * 백엔드가 "생성 중"일 때 빈 리스트를 반환할 수 있음.
 * => create 결과가 비면 짧게 GET 재조회(폴링)로 채운다.
 */
export const createCluster = async (wordId) => {
  if (!wordId) throw new Error("createCluster: wordId가 필요합니다.");

  const key = String(wordId);

  if (createPromiseCache.has(key)) return createPromiseCache.get(key);

  const promise = (async () => {
    const res = await httpClient.post("/api/cluster/create", null, {
      params: { wordId: key },
    });

    // 1) grouped 형태면 우선
    const groupedFromCreate = normalizeGrouped(res?.data);

    // 2) raw list면 매핑
    const mappedFromCreate =
      groupedFromCreate ?? (Array.isArray(res?.data) ? mapRawClusters(res.data) : null);

    // 3) create 결과가 비면(생성 중 빈 리스트 등) GET 폴링
    let finalGrouped = mappedFromCreate;

    if (isEmptyGrouped(finalGrouped)) {
      // 3회 정도면 충분 (총 ~900ms)
      for (let i = 0; i < 3; i++) {
        await sleep(250 + i * 150);
        const g = await getClustersByCenter(key, { useCache: false });
        if (!isEmptyGrouped(g)) {
          finalGrouped = g;
          break;
        }
      }
    }

    // 그래도 비면 마지막으로 GET 한 번 더 (안전망)
    if (isEmptyGrouped(finalGrouped)) {
      finalGrouped = await getClustersByCenter(key, { useCache: false });
    }

    clusterCache.set(key, finalGrouped);
    return finalGrouped;
  })();

  createPromiseCache.set(key, promise);

  try {
    return await promise;
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
 * - 관련 캐시 제거
 */
export const deleteClusterByCenter = async (wordId) => {
  if (!wordId) throw new Error("deleteClusterByCenter: wordId가 필요합니다.");

  const key = String(wordId);
  const res = await httpClient.delete("/api/cluster", { params: { wordId: key } });

  clusterCache.delete(key);
  createPromiseCache.delete(key);

  return res.data;
};

/**
 * 로그인 유저의 모든 클러스터 삭제
 * DELETE /api/cluster/all
 * - 캐시 전체 제거
 */
export const deleteAllClusters = async () => {
  const res = await httpClient.delete("/api/cluster/all");
  clusterCache.clear();
  createPromiseCache.clear();
  return res.data;
};

/**
 * (선택) 외부에서 캐시 초기화
 * - 로그아웃/계정 변경/대규모 갱신 시 사용
 */
export const clearClusterCache = () => {
  clusterCache.clear();
  createPromiseCache.clear();
};
