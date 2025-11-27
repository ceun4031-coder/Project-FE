// components/words/WordFilter.jsx
import { useState } from "react";
import "./WordFilter.css";

function WordFilter({ filter, setFilter }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const CATEGORY_OPTIONS = [
    { label: "전체", value: "All" },
    { label: "명사 (Noun)", value: "Noun" },
    { label: "동사 (Verb)", value: "Verb" },
    { label: "형용사 (Adj)", value: "Adj" },
    { label: "부사 (Adv)", value: "Adv" },
  ];

  const DOMAIN_OPTIONS = [
    { label: "전체", value: "All" },
    { label: "일상생활 (Daily Life)", value: "Daily Life" },
    { label: "사람/감정 (People & Feelings)", value: "People & Feelings" },
    { label: "직장/비즈니스 (Business)", value: "Business" },
    { label: "학교/학습 (School & Learning)", value: "School & Learning" },
    { label: "여행/교통 (Travel)", value: "Travel" },
    { label: "음식/건강 (Food & Health)", value: "Food & Health" },
    { label: "기술/IT (Technology)", value: "Technology" },
  ];

  const LEVEL_OPTIONS = [
    { label: "전체 난이도", value: "All" },
    { label: "Lv.1", value: 1 },
    { label: "Lv.2", value: 2 },
    { label: "Lv.3", value: 3 },
    { label: "Lv.4", value: 4 },
    { label: "Lv.5", value: 5 },
    { label: "Lv.6", value: 6 },
  ];

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const selectOption = (type, value) => {
    setFilter((prev) => ({ ...prev, [type]: value }));
    setOpenDropdown(null);
  };

  const getLabel = (type, options) => {
    const current = filter[type];
    const found = options.find((opt) => opt.value === current);
    return found ? found.label : options[0].label;
  };

  return (
    <div className="filter-container">
      {/* 품사 */}
      <div className="filter-group">
        <span className="filter-label">품사</span>
        <div className="dropdown-box">
          <button
            type="button"
            className={`dropdown-btn ${
              filter.category !== "All" ? "selected" : ""
            }`}
            onClick={() => toggleDropdown("category")}
          >
            {getLabel("category", CATEGORY_OPTIONS)}
            <span className="arrow">▾</span>
          </button>

          {openDropdown === "category" && (
            <div className="dropdown-menu">
              {CATEGORY_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className="dropdown-item"
                  onClick={() => selectOption("category", opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 분야 */}
      <div className="filter-group">
        <span className="filter-label">분야</span>
        <div className="dropdown-box">
          <button
            type="button"
            className={`dropdown-btn ${
              filter.domain !== "All" ? "selected" : ""
            }`}
            onClick={() => toggleDropdown("domain")}
          >
            {getLabel("domain", DOMAIN_OPTIONS)}
            <span className="arrow">▾</span>
          </button>

          {openDropdown === "domain" && (
            <div className="dropdown-menu">
              {DOMAIN_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className="dropdown-item"
                  onClick={() => selectOption("domain", opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 난이도 */}
      <div className="filter-group">
        <span className="filter-label">난이도</span>
        <div className="dropdown-box">
          <button
            type="button"
            className={`dropdown-btn ${
              filter.level !== "All" ? "selected" : ""
            }`}
            onClick={() => toggleDropdown("level")}
          >
            {getLabel("level", LEVEL_OPTIONS)}
            <span className="arrow">▾</span>
          </button>

          {openDropdown === "level" && (
            <div className="dropdown-menu">
              {LEVEL_OPTIONS.map((opt) => (
                <div
                  key={opt.label}
                  className="dropdown-item"
                  onClick={() => selectOption("level", opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WordFilter;
