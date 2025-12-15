// src/pages/wrongnote/components/WrongNoteItem.jsx
export function WrongNoteItem({ item, selected, onToggle, onClick }) {
  // --- 단어/뜻: 문자열로 강제 변환 ---
  const rawWord = item.word || item.wordText || null;

  const word =
    typeof rawWord === "string"
      ? rawWord
      : rawWord && typeof rawWord === "object"
      ? rawWord.word ?? rawWord.text ?? ""
      : "";

  const rawMeaning =
    item.meaning ||
    item.korean ||
    item.meaningKo ||
    (rawWord && typeof rawWord === "object" ? rawWord.meaning : null);

  const meaning =
    typeof rawMeaning === "string"
      ? rawMeaning
      : rawMeaning && typeof rawMeaning === "object"
      ? rawMeaning.meaning ?? rawMeaning.meaningKo ?? ""
      : "";

  // --- 난이도 ---
  const rawLevel =
    item.wordLevel ??
    item.level ??
    (rawWord && typeof rawWord === "object" ? rawWord.level : null);

  const levelLabel = (() => {
    if (rawLevel == null) return "-";
    const n = Number(rawLevel);
    if (Number.isNaN(n)) return String(rawLevel);
    return `Lv.${n}`;
  })();

  // --- 마지막 오답 일시 ---
  const rawLastWrongAt = item.wrongAt || item.lastWrongAt || item.wrong_at;
  let lastWrongAtDate = "-";
  let lastWrongAtFull = "";

  if (rawLastWrongAt) {
    const d = new Date(rawLastWrongAt);
    if (!Number.isNaN(d.getTime())) {
      lastWrongAtDate = d.toLocaleDateString("ko-KR");
      lastWrongAtFull = d.toLocaleString("ko-KR");
    } else {
      lastWrongAtDate = String(rawLastWrongAt);
      lastWrongAtFull = String(rawLastWrongAt);
    }
  }

  // --- 오답 횟수 ---
  const totalWrong = item.totalWrong ?? item.wrongCount ?? item.wrong ?? 0;

  const ellipsisStyle = {
    maxWidth: 320,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "inline-block",
    verticalAlign: "bottom",
  };

  const handleRowClick = () => {
    onToggle?.();
    onClick?.(item);
  };

  return (
    <tr
      className="wrongnote-item"
      onClick={handleRowClick}
      role="row"
      aria-selected={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <td onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="sl-checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          aria-label="오답 선택"
        />
      </td>

      <td title={word || undefined}>
        <span style={ellipsisStyle}>{word}</span>
      </td>

      <td title={meaning || undefined}>
        <span style={ellipsisStyle}>{meaning}</span>
      </td>

      <td>{levelLabel}</td>
      <td>{totalWrong}회</td>
      <td title={lastWrongAtFull || undefined}>{lastWrongAtDate}</td>
    </tr>
  );
}
