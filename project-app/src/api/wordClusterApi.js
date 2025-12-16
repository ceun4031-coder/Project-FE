// src/api/wordClusterApi.js
import httpClient from "./httpClient";

/**
 * Word Cluster API (연관 단어)
 *
 * 백엔드(현재 코드) 기준
 * - GET  /api/cluster?wordId=1         -> List<ClusterWord>
 * - POST /api/cluster/create?wordId=1&forceRegenerate=false
 *      -> { success, count, message, isNew }  // (클러스터 리스트 미포함)
 * - DELETE /api/cluster?wordId=1       -> { success, message }
 *
 * 프론트 요구 형태
 * - getClustersByCenter(wordId, { useCache }) -> { similar: [], opposite: [] }
 * - createCluster(wordId, { forceRegenerate }) -> { similar: [], opposite: [] }
 *
 * 캐시 정책
 * - 메모리 캐시(새로고침 전까지 유지)
 * - 동일 wordId 중복 생성 방지: in-flight Promise 재사용
 */

// 메모리 캐시: key=wordId(string) -> grouped
const clusterCache = new Map();
// 생성 중복 방지: key=wordId(string) -> Promise<grouped>
const createPromiseCache = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isEmptyGrouped = (g) =>
  !g ||
  ((g.similar?.length ?? 0) === 0 && (g.opposite?.length ?? 0) === 0);

/**
 * (방어) grouped 표준 형태 보장
 * - 서버가 grouped를 주는 경우도 대비(현재 백엔드는 GET이 List를 줌)
 */
const normalizeGrouped = (data) => {
  if (!data || typeof data !== "object") return null;

  if ("similar" in data || "opposite" in data) {
    return {
      similar: Array.isArray(data.similar) ? data.similar : [],
      opposite: Array.isArray(data.opposite) ? data.opposite : [],
    };
  }

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
 * GET(List<ClusterWord>) 응답을 grouped로 매핑
 * - ClusterWord 엔티티 예상 필드:
 *   - id/clusterId/clusterWordId
 *   - centerWord (Word)
 *   - relatedWord (Word)
 *   - score (Double)
 *   - type 또는 relationType (String) : "synonym" | "antonym" | "similarity" ...
 */
const mapRawClusters = (raw) => {
  const grouped = { similar: [], opposite: [] };
  if (!Array.isArray(raw)) return grouped;

  raw.forEach((item) => {
    const related =
      (item?.relatedWord && typeof item.relatedWord === "object" && item.relatedWord) ||
      (item?.related && typeof item.related === "object" && item.related) ||
      (item?.relatedWordDto && typeof item.relatedWordDto === "object" && item.relatedWordDto) ||
      {};

    const center =
      (item?.centerWord && typeof item.centerWord === "object" && item.centerWord) ||
      (item?.center && typeof item.center === "object" && item.center) ||
      (item?.word && typeof item.word === "object" && item.word) ||
      {};

    const typeRaw =
      item?.relationType ??
      item?.type ??
      item?.relation ??
      item?.relation_type;

    const type = typeof typeRaw === "string" ? typeRaw.trim().toLowerCase() : "";

    const text = related?.word ?? related?.text ?? related?.name;
    if (!text) return;

    const centerWordId = center?.wordId ?? center?.id ?? item?.centerWordId ?? item?.wordId;
    const relatedWordId = related?.wordId ?? related?.id ?? item?.relatedWordId;

    const dto = {
      id:
        item?.clusterId ??
        item?.clusterWordId ??
        item?.id ??
        `${centerWordId ?? ""}-${relatedWordId ?? text}`,

      centerWordId,
      wordId: relatedWordId,

      text,
      meaning:
        related?.meaningKo ??
        related?.meaning_ko ??
        related?.meaning ??
        related?.definition ??
        related?.korean ??
        "",

      level:
        typeof related?.level === "number"
          ? related.level
          : typeof item?.level === "number"
          ? item.level
          : undefined,

      score: typeof item?.score === "number" ? item.score : undefined,

      type, // "synonym" | "antonym" | "similarity" ...
      inMyList: !!(item?.inMyList || related?.inMyList), // 백엔드가 안주면 false
    };

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

  // 에러 객체로 오는 케이스 방어(백엔드가 badRequest body에 success:false 넣음)
  if (res?.data && typeof res.data === "object" && res.data.success === false) {
    throw new Error(res.data.message || "클러스터 조회 실패");
  }

  // 현재 백엔드 정상 응답: List<ClusterWord>
  const groupedDirect = normalizeGrouped(res?.data);
  const grouped = groupedDirect ?? mapRawClusters(res?.data);

  clusterCache.set(key, grouped);
  return grouped;
};

/**
 * 클러스터 생성 트리거
 * POST /api/cluster/create?wordId={wordId}&forceRegenerate=false
 *
 * ⚠️ 현재 백엔드 응답은 메타데이터만 내려줌(리스트 미포함)
 * => POST 후 GET으로 실제 데이터를 가져오고, 비어있으면 짧게 폴링
 */
export const createCluster = async (wordId, options = {}) => {
  if (!wordId) throw new Error("createCluster: wordId가 필요합니다.");

  const { forceRegenerate = false } = options;
  const key = String(wordId);

  if (createPromiseCache.has(key)) return createPromiseCache.get(key);

  const promise = (async () => {
    const res = await httpClient.post("/api/cluster/create", null, {
      params: { wordId: key, forceRegenerate },
    });

    // create 응답이 success:false면 에러
    if (res?.data && typeof res.data === "object" && res.data.success === false) {
      throw new Error(res.data.message || "클러스터 생성 실패");
    }

    // POST는 트리거. 실제 결과는 GET으로 조회
    let finalGrouped = await getClustersByCenter(key, { useCache: false });

    // 백엔드 서비스 로직상 "생성 중(락)"이면 빈 리스트가 나올 수 있음
    // (특히 동시에 여러 요청 들어오면 한쪽은 빈 리스트 반환)
    if (isEmptyGrouped(finalGrouped)) {
      for (let i = 0; i < 3; i++) {
        await sleep(250 + i * 150);
        const g = await getClustersByCenter(key, { useCache: false });
        if (!isEmptyGrouped(g)) {
          finalGrouped = g;
          break;
        }
      }
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
 * 특정 중심 단어의 클러스터 삭제
 * DELETE /api/cluster?wordId={wordId}
 */
export const deleteClusterByCenter = async (wordId) => {
  if (!wordId) throw new Error("deleteClusterByCenter: wordId가 필요합니다.");

  const key = String(wordId);
  const res = await httpClient.delete("/api/cluster", { params: { wordId: key } });

  clusterCache.delete(key);
  createPromiseCache.delete(key);

  // 백엔드가 success:false로 내려주는 케이스 방어
  if (res?.data && typeof res.data === "object" && res.data.success === false) {
    throw new Error(res.data.message || "클러스터 삭제 실패");
  }

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
