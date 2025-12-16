// src/pages/auth/components/BirthdateSelector.jsx
import { useState, useMemo, useEffect } from "react";
import FilterDropdown from "@/components/common/FilterDropdown";
import "./BirthdateSelector.css";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 120;
const MAX_YEAR = CURRENT_YEAR;
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

  return new Date(y, m, 0).getDate();
}

export default function BirthdateSelector({
  name = "userBirth",
  value,
  onChange,
  error,
}) {
  const [openId, setOpenId] = useState(null); // "year" | "month" | "day" | null

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  // 외부 value 동기화
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
  const handleClose = () => setOpenId(null);

  const handleChangeDropdown = (id, nextValue) => {
    if (id === "year") setYear(nextValue);
    if (id === "month") setMonth(nextValue);
    if (id === "day") setDay(nextValue);

    let nextYear = id === "year" ? nextValue : year;
    let nextMonth = id === "month" ? nextValue : month;
    let nextDay = id === "day" ? nextValue : day;

    const daysInMonth = getDaysInMonth(nextYear, nextMonth);
    if (nextDay) {
      const n = Number(nextDay);
      if (n > daysInMonth) {
        nextDay = String(daysInMonth).padStart(2, "0");
        setDay(nextDay);
      }
    }

    const fullSelected = nextYear && nextMonth && nextDay;
    if (!onChange || !fullSelected) return;

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
            options={YEAR_OPTIONS}
            value={year}
            isOpen={openId === "year"}
            onToggle={handleToggle}
              onClose={handleClose} 
            onChange={handleChangeDropdown}
          />
        </div>

        <div className="birthdate-col">
          <FilterDropdown
            id="month"
            options={MONTH_OPTIONS}
            value={month}
            isOpen={openId === "month"}
            onToggle={handleToggle}
              onClose={handleClose} 
            onChange={handleChangeDropdown}
          />
        </div>

        <div className="birthdate-col">
          <FilterDropdown
            id="day"
            options={DAY_OPTIONS}
            value={day}
            isOpen={openId === "day"}
            onToggle={handleToggle}
              onClose={handleClose} 
            onChange={handleChangeDropdown}
          />
        </div>
      </div>

      {error && <p className="form-error birthdate-error">{error}</p>}
    </div>
  );
}
