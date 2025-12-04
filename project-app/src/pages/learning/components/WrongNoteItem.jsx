// src/pages/wrongnote/components/WrongNoteItem.jsx

export function WrongNoteItem({ item, selected, onToggleSelect, onClick }) {
  const word = item.word || item.wordText || "";
  const meaning = item.meaning || item.korean || item.meaningKo || "";

  // 난이도(raw)
  const rawLevel =
    item.wordLevel ??
    item.level ??
    item.difficultyLevel ??
    item.difficulty ??
    null;

  const getLevelLabel = (lv) => {
    if (lv == null) return "-";

    const n = Number(lv);
    if (Number.isNaN(n)) return lv; // 문자열(EASY/HARD 등)은 그대로

    if (n <= 1) return "초급";
    if (n === 2) return "중급";
    if (n >= 3) return "고급";
    return `Lv.${n}`;
  };

  const levelLabel = getLevelLabel(rawLevel);

  // 마지막 오답 일시
  const rawLastWrongAt = item.lastWrongAt || item.wrongAt || item.wrong_at;
  let lastWrongAtDate = "-";
  let lastWrongAtFull = "";

  if (rawLastWrongAt) {
    const d = new Date(rawLastWrongAt);
    if (!Number.isNaN(d.getTime())) {
      // 리스트에는 날짜만
      lastWrongAtDate = d.toLocaleDateString("ko-KR"); // 예: 2025. 12. 2.
      // 툴팁/타이틀로 전체 일시
      lastWrongAtFull = d.toLocaleString("ko-KR");
    } else {
      lastWrongAtDate = rawLastWrongAt;
      lastWrongAtFull = rawLastWrongAt;
    }
  }

  // 오답 횟수
  const totalWrong =
    item.totalWrong ?? item.wrongCount ?? item.wrong ?? 0;

  // 스토리 사용 여부
  const used =
    item.isUsedInStory === "Y" ||
    item.isUsedInStory === "y" ||
    item.isUsedInStory === true;

  return (
    <tr className="wrongnote-item" onClick={onClick}>
      <td>
        <input type="checkbox" className="sl-checkbox" checked={selected} onChange={onToggleSelect} />
      </td>
      <td>{word}</td>
      <td>{meaning}</td>
      <td>{levelLabel}</td>
      <td title={lastWrongAtFull || undefined}>{lastWrongAtDate}</td>
      <td>{totalWrong}회</td>
      <td>
        {used ? (
          <span className="badge badge--used">사용됨</span>
        ) : (
          <span className="badge badge--unused">미사용</span>
        )}
      </td>
    </tr>
  );
}