import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  subLabel?: string;
  meta?: any;
}

export interface SearchableSelectProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string, meta?: any) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  allowCustomInput?: boolean;
  searchPlaceholder?: string;
  noOptionsText?: string;
  helperText?: string;
  id?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = '-- Select --',
  disabled = false,
  disabledPlaceholder = '-- Select previous field first --',
  allowCustomInput = false,
  searchPlaceholder = 'Search...',
  noOptionsText = 'No options found',
  helperText,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens (for non-custom mode)
  useEffect(() => {
    if (isOpen && !allowCustomInput && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, allowCustomInput]);

  // Find matching option label
  const selectedOption = options.find(
    (opt) => opt.value.toLowerCase() === (value || '').toLowerCase()
  );

  // Filter options based on search query
  const query = (allowCustomInput ? value : searchTerm).trim().toLowerCase();
  const filteredOptions = options.filter((opt) => {
    if (!query) return true;
    return (
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(query))
    );
  });

  const handleSelectOption = (opt: SelectOption) => {
    onChange(opt.value, opt.meta);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', undefined);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger element */}
      {allowCustomInput ? (
        // Mode A: Free-text editable input with dropdown suggestions (for Taluka & Village)
        <div className="relative">
          <input
            id={id}
            type="text"
            value={value}
            disabled={disabled}
            onChange={(e) => {
              onChange(e.target.value, undefined);
              if (!isOpen && options.length > 0) {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (!disabled && options.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={disabled ? disabledPlaceholder : placeholder}
            className={`w-full pl-3 pr-8 py-2 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
              disabled
                ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-50 border-stone-300 text-stone-900 focus:ring-2 focus:ring-forest-600 focus:bg-white'
            }`}
          />
          {!disabled && options.length > 0 && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2 top-2.5 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      ) : (
        // Mode B: Selectable Searchable Dropdown (for State & District)
        <div
          id={id}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              setSearchTerm('');
            }
          }}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer select-none ${
            disabled
              ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
              : isOpen
              ? 'bg-white border-forest-600 ring-2 ring-forest-600 text-stone-900'
              : 'bg-stone-50 border-stone-300 text-stone-900 hover:bg-stone-100/80'
          }`}
        >
          <span className="truncate">
            {disabled
              ? disabledPlaceholder
              : selectedOption
              ? selectedOption.label
              : value || <span className="text-stone-400 font-normal">{placeholder}</span>}
          </span>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {!disabled && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600"
                title="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-forest-700' : ''
              }`}
            />
          </div>
        </div>
      )}

      {helperText && !disabled && (
        <p className="text-[10px] text-stone-400 mt-0.5 truncate">{helperText}</p>
      )}

      {/* Dropdown Popover */}
      {isOpen && !disabled && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-stone-300 overflow-hidden animate-fadeIn">
          {/* Search bar inside dropdown (for Mode B: State & District) */}
          {!allowCustomInput && (
            <div className="p-2 border-b border-stone-100 bg-stone-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:border-forest-600"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto divide-y divide-stone-100">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-stone-500 text-center">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value.toLowerCase() === (value || '').toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-forest-50/90 text-forest-950 font-bold'
                        : 'text-stone-800 hover:bg-stone-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.subLabel && (
                        <div className="text-[10px] text-stone-400 font-normal truncate">
                          {opt.subLabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-forest-700 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
