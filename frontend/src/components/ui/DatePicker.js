import React from 'react';
import DatePickerLib from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

/**
 * Custom DatePicker Component using react-datepicker
 * Replaces Bootstrap date inputs with modern fintech styling
 */
const DatePicker = ({ selected, onChange, placeholder = 'Select date', showMonthYearPicker = false, ...props }) => {
  // Handle date parsing - support both YYYY-MM-DD and YYYY-MM formats
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // If it's already a Date object, return it
    if (dateString instanceof Date) return dateString;
    
    // Handle YYYY-MM format (month picker)
    if (showMonthYearPicker && /^\d{4}-\d{2}$/.test(dateString)) {
      const [year, month] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    
    // Handle YYYY-MM-DD format (date picker)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }
    
    // Try to parse as Date
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Format date for output
  const formatDate = (date) => {
    if (!date) return '';
    
    if (showMonthYearPicker) {
      // Return YYYY-MM format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } else {
      // Return YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    }
  };

  return (
    <div className="datepicker-wrapper" style={{ position: 'relative' }}>
      <DatePickerLib
        selected={parseDate(selected)}
        onChange={(date) => {
          if (date) {
            onChange(formatDate(date));
          } else {
            onChange('');
          }
        }}
        dateFormat={showMonthYearPicker ? 'yyyy-MM' : 'yyyy-MM-dd'}
        showMonthYearPicker={showMonthYearPicker}
        placeholderText={placeholder}
        className="form-control"
        wrapperClassName="datepicker-input-wrapper"
        calendarClassName={showMonthYearPicker ? "custom-calendar react-datepicker--month-only" : "custom-calendar"}
        {...props}
      />
      <Calendar
        size={16}
        strokeWidth={1.75}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--text-secondary)',
          opacity: 0.5,
          transition: 'opacity 0.2s ease'
        }}
      />
    </div>
  );
};

export default DatePicker;

