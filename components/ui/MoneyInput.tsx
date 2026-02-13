import React from 'react';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({ value, onChange, placeholder, className, autoFocus }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    const rawValue = e.target.value.replace(/\D/g, '');
    const numValue = rawValue ? parseInt(rawValue, 10) : 0;
    onChange(numValue);
  };

  // Format display value with dots (Vietnam style)
  const displayValue = value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '';

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
      inputMode="numeric"
    />
  );
};
