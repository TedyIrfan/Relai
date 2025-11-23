import React, { useState, useEffect } from 'react';
import { formatCurrency, parseCurrency, formatNumber, parseNumber, validateInput } from '../utils/calculations';

/**
 * Reusable Number Input Component
 * Supports both currency and regular number formatting
 */
const NumberInput = ({
  value = 0,
  onChange,
  placeholder = "0",
  type = "number",
  showCurrency = true,
  readOnly = false,
  className = "",
  maxLength = 20,
  field = "",
  showError = true,
  autoFocus = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format value for display
  const formatDisplayValue = (val) => {
    if (isFocused && !readOnly) {
      return val.toString(); // Show raw value when focused
    }

    if (type === 'currency') {
      return formatCurrency(val);
    } else {
      return formatNumber(val);
    }
  };

  // Initialize input value
  useEffect(() => {
    setInputValue(formatDisplayValue(value));
  }, [value, type, showCurrency, isFocused, readOnly]);

  // Handle input change
  const handleChange = (e) => {
    if (readOnly) return;

    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse to number
    const parsedValue = type === 'currency' ? parseCurrency(newValue) : parseNumber(newValue);

    // Validate input
    const validation = validateInput(field, parsedValue, type);
    setError(validation.message);

    if (validation.isValid) {
      onChange(parsedValue);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    // Show raw value for editing
    setInputValue(value.toString());
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // Format display value
    setInputValue(formatDisplayValue(value));
    setError(''); // Clear error on blur
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger blur to format value
    }

    // Allow only numbers, backspace, delete, tab, enter, and decimal point
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End',
      '.'
    ];

    if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  // Determine input classes
  const inputClasses = `
    w-full px-2 py-1 text-right border rounded transition-colors duration-200
    ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}
    ${isFocused && !readOnly ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}
    ${error && showError ? 'border-red-500 ring-2 ring-red-200' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={inputClasses}
        title={error || (readOnly ? 'Read-only field' : '')}
      />

      {/* Error indicator */}
      {error && showError && (
        <div className="absolute -top-6 right-0 text-xs text-red-600 bg-white px-1 rounded whitespace-nowrap">
          {error}
        </div>
      )}

      {/* Status indicator */}
      {type === 'currency' && !readOnly && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
          Rp
        </div>
      )}

      {/* Read-only indicator */}
      {readOnly && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          🔒
        </div>
      )}
    </div>
  );
};

export default NumberInput;