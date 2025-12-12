const POS_MAP = {
  noun: "명사",
  n: "명사",

  verb: "동사",
  v: "동사",

  adjective: "형용사",
  adj: "형용사",
  a: "형용사",

  adverb: "부사",
  adv: "부사",

  preposition: "전치사",
  prep: "전치사",

  pronoun: "대명사",
  pro: "대명사",

  conjunction: "접속사",
  conj: "접속사",

  interjection: "감탄사",
  interj: "감탄사",
  exclamation: "감탄사",

  determiner: "한정사",
  det: "한정사",

  "definite article": "정관사",
  "indefinite article": "부정관사",

  "modal verb": "조동사",
  "linking verb": "연결동사",
  "infinitive marker": "부정사",

  number: "수사",
  "ordinal number": "서수사",

  unknown: "품사",
};

export function toKoreanPOS(pos) {
  if (!pos) return "";
  const key = pos.toString().trim().toLowerCase();
  return POS_MAP[key] ?? pos; // 없으면 원래값 표시
}
