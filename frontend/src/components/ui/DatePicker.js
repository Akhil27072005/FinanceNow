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
    
    // If it's already a Date object, ensure it's in local time
    if (dateString instanceof Date) {
      // Create a new date using local components to avoid timezone issues
      const year = dateString.getFullYear();
      const month = dateString.getMonth();
      const day = dateString.getDate();
      // Use noon (12:00) to avoid timezone edge cases at midnight
      return new Date(year, month, day, 12, 0, 0);
    }
    
    // Handle YYYY-MM format (month picker)
    if (showMonthYearPicker && /^\d{4}-\d{2}$/.test(dateString)) {
      const [year, month] = dateString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1, 12, 0, 0);
    }
    
    // Handle YYYY-MM-DD format (date picker)
    // Parse using local time components to avoid timezone shifts
    // Use noon (12:00) instead of midnight to avoid timezone edge cases
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0);
    }
    
    // Try to parse as Date and convert to local
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return null;
    // Convert to local date at noon
    const year = parsed.getFullYear();
    const month = parsed.getMonth();
    const day = parsed.getDate();
    return new Date(year, month, day, 12, 0, 0);
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
      // Return YYYY-MM-DD format using local time to avoid timezone issues
      // Use local date components instead of toISOString() which converts to UTC
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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

