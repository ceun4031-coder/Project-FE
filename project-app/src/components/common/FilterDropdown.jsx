// src/components/common/FilterDropdown.jsx
import { ChevronDown } from "lucide-react";
import "./FilterDropdown.css";

function FilterDropdown({
  id,
  label,
  options,
  value,
  isOpen,
  onToggle,     // (id) => void
  onChange,     // (id, nextValue) => void
}) {
  const current = options.find((opt) => opt.value === value) || options[0];
  const isSelected = value !== options[0].value;

  return (
    <div className="filter-group">
      {label && <span className="filter-label">{label}</span>}

      <div className="dropdown-box">
        <button
          type="button"
          className={`dropdown-btn no-select ${isSelected ? "selected" : ""}`}
          onClick={() => onToggle(id)}
        >
          {current.label}
          <ChevronDown size={14} className="arrow" />
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`dropdown-item ${
                  value === opt.value ? "active" : ""
                }`}
                onClick={() => onChange(id, opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterDropdown;
