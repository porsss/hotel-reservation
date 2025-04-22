// src/components/Dropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const Dropdown = ({ label, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle option click
  const handleOptionClick = (action) => {
    setIsOpen(false);
    if (typeof action === "function") {
      action();
    }
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="text-black dropdown-toggle btn btn-link text-decoration-none"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {label}
      </button>
      <ul className={`dropdown-menu dropdown-menu-end ${isOpen ? "show" : ""}`}>
        {options &&
          // eslint-disable-next-line react/prop-types
          options.map((option, index) => (
            <li key={index}>
              <button
                className="dropdown-item"
                onClick={() => handleOptionClick(option.action)}
              >
                {option.label}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};
Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func,
    })
  ).isRequired,
};

export default Dropdown;
