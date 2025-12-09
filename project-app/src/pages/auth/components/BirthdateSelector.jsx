// src/pages/auth/components/BirthdateSelector.jsx
import { useState, useMemo, useEffect } from "react";
import FilterDropdown from "@/components/common/FilterDropdown";
import "./BirthdateSelector.css";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 80; // 80년 전까지
const MAX_YEAR = CURRENT_YEAR - 10; // 최소 10살 기준

const YEAR_OPTIONS = [
  { label: "연도 선택", value: "" },
  ...Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, idx) => {
    const year = MAX_YEAR - idx;
    return { label: `${year}년`, value: String(year) };
  }),
];

const MONTH_OPTIONS = [
  { label: "월 선택", value: "" },
  ...Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    const v = String(month).padStart(2, "0");
    return { label: `${month}월`, value: v };
  }),
];

function getDaysInMonth(year, month) {
  if (!year || !month) return 31;
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return 31;

  // m월의 마지막 날
  return new Date(y, m, 0).getDate();
}

export default function BirthdateSelector({
  name = "userBirth",
  value,
  onChange,
  error,
}) {
  const [openId, setOpenId] = useState(null); // "year" | "month" | "day" | null

  // 부모에서 내려온 value("YYYY-MM-DD")를 로컬 state로 분해
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  // value가 외부에서 바뀔 수도 있으니 동기화
  useEffect(() => {
    const [y, m, d] = (value || "").split("-");
    setYear(y || "");
    setMonth(m || "");
    setDay(d || "");
  }, [value]);

  const maxDays = useMemo(
    () => getDaysInMonth(year, month),
    [year, month]
  );

  const DAY_OPTIONS = useMemo(
    () => [
      { label: "일 선택", value: "" },
      ...Array.from({ length: maxDays }, (_, idx) => {
        const d = idx + 1;
        const v = String(d).padStart(2, "0");
        return { label: `${d}일`, value: v };
      }),
    ],
    [maxDays]
  );

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleChangeDropdown = (id, nextValue) => {
    // 1) 로컬 state 먼저 갱신
    if (id === "year") setYear(nextValue);
    if (id === "month") setMonth(nextValue);
    if (id === "day") setDay(nextValue);

    // 2) 새로 선택된 값 기준으로 full date 계산
    let nextYear = id === "year" ? nextValue : year;
    let nextMonth = id === "month" ? nextValue : month;
    let nextDay = id === "day" ? nextValue : day;

    // 해당 연/월에 맞춰 일수 보정
    const daysInMonth = getDaysInMonth(nextYear, nextMonth);
    if (nextDay) {
      const n = Number(nextDay);
      if (n > daysInMonth) {
        nextDay = String(daysInMonth).padStart(2, "0");
        setDay(nextDay); // 로컬 state도 보정
      }
    }

    const fullSelected = nextYear && nextMonth && nextDay;
    if (!onChange || !fullSelected) {
      return; // 아직 세 값이 다 안 채워졌으면 부모로 안 올림
    }

    const final = `${nextYear}-${nextMonth}-${nextDay}`;

    onChange({
      target: {
        name,
        value: final,
      },
    });
  };

  return (
    <div className={`birthdate-group ${error ? "birthdate-group--error" : ""}`}>
      <div className="birthdate-row">
        <div className="birthdate-col">
          <FilterDropdown
            id="year"
            label="연도"
            options={YEAR_OPTIONS}
            value={year}
            isOpen={openId === "year"}
            onToggle={handleToggle}
            onChange={handleChangeDropdown}
          />
        </div>

        <div className="birthdate-col">
          <FilterDropdown
            id="month"
            label="월"
            options={MONTH_OPTIONS}
            value={month}
            isOpen={openId === "month"}
            onToggle={handleToggle}
            onChange={handleChangeDropdown}
          />
        </div>

        <div className="birthdate-col">
          <FilterDropdown
            id="day"
            label="일"
            options={DAY_OPTIONS}
            value={day}
            isOpen={openId === "day"}
            onToggle={handleToggle}
            onChange={handleChangeDropdown}
          />
        </div>
      </div>

      {error && <p className="form-error birthdate-error">{error}</p>}
    </div>
  );
}
