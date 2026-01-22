// src/filters/DateRangeFilter.jsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiCalendarLine, RiArrowDownSLine, RiCheckLine } from 'react-icons/ri';
import './Filters.css';

const DateRangeFilter = ({ 
  selectedRange, 
  onSelectRange,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Options de période
  const dateRanges = [
    { id: 'today', labelKey: 'filters.today' },
    { id: 'yesterday', labelKey: 'filters.yesterday' },
    { id: 'last7days', labelKey: 'filters.last7Days' },
    { id: 'last30days', labelKey: 'filters.last30Days' },
    { id: 'thisMonth', labelKey: 'filters.thisMonth' },
    { id: 'lastMonth', labelKey: 'filters.lastMonth' },
    { id: 'thisYear', labelKey: 'filters.thisYear' },
    { id: 'custom', labelKey: 'filters.custom' },
    { id: 'all', labelKey: 'filters.all' }

  ];

  // Fermer dropdown si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sélectionner une période
  const handleSelect = (range) => {
    onSelectRange(range);
    setIsOpen(false);
  };

  // Label affiché
  const currentRange = dateRanges.find(r => r.id === selectedRange?.id) || dateRanges[4]; // Default: thisMonth
  const displayLabel = t(currentRange.labelKey);

  return (
    <div className={`filter-dropdown ${className}`} ref={dropdownRef}>
      <button 
        className={`filter-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <RiCalendarLine className="filter-icon" />
        <span className="filter-label">{displayLabel}</span>
        <RiArrowDownSLine className={`filter-arrow ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="filter-menu">
          <div className="filter-list">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                className={`filter-item ${selectedRange?.id === range.id ? 'selected' : ''}`}
                onClick={() => handleSelect(range)}
              >
                <span>{t(range.labelKey)}</span>
                {selectedRange?.id === range.id && (
                  <RiCheckLine className="filter-check" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;