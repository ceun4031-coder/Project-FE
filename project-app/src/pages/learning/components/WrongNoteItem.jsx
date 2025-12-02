// src/pages/wrongnote/components/WrongNoteItem.jsx
// import './WrongNoteItem.css';

export function WrongNoteItem({ item, selected, onToggleSelect, onClick }) {
  // 백엔드 응답 이름이 조금씩 달라도 버틸 수 있게 방어적으로 처리
  const word = item.word || item.wordText || '';
  const meaning = item.meaning || item.korean || item.meaningKo || '';

  // 마지막 오답 일시
  const rawLastWrongAt = item.lastWrongAt || item.wrongAt || item.wrong_at;
  let lastWrongAtDisplay = '-';
  if (rawLastWrongAt) {
    const d = new Date(rawLastWrongAt);
    lastWrongAtDisplay = Number.isNaN(d.getTime())
      ? rawLastWrongAt
      : d.toLocaleString('ko-KR');
  }

  // 정답/오답 횟수
  const totalCorrect =
    item.totalCorrect ??
    item.correctCount ??
    item.correct ??
    0;

  const totalWrong =
    item.totalWrong ??
    item.wrongCount ??
    item.wrong ??
    0;

  // 학습 상태 (STUDY_LOG.STATUS 등)
  const status =
    item.status ||
    item.studyStatus ||
    item.learningStatus ||
    '';

  // TAG 컬럼은 DDL에서 삭제됐지만,
  // 백엔드에서 파생값으로 내려줄 수도 있으니 있으면 표시, 없으면 '-'
  const tag =
    item.tag ||
    item.sourceType ||
    item.origin ||
    '';

  // 스토리 사용 여부 (Y/N 또는 boolean 대응)
  const used =
    item.isUsedInStory === 'Y' ||
    item.isUsedInStory === 'y' ||
    item.isUsedInStory === true;

  return (
    <tr
      className="wrongnote-item"
      onClick={onClick}
    >
      <td>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>
      <td>{word}</td>
      <td>{meaning}</td>
      <td>{lastWrongAtDisplay}</td>
      <td>
        {totalCorrect} / {totalWrong}
      </td>
      <td>{status || '-'}</td>
      <td>{tag || '-'}</td>
      <td>
        {used ? (
          <span className="badge badge--used">스토리에 사용됨</span>
        ) : (
          <span className="badge badge--unused">미사용</span>
        )}
      </td>
    </tr>
  );
}
