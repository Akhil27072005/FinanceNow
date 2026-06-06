import React, { useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import DatePicker from '../ui/DatePicker';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { formatReportsDateRangeLabel } from '../../utils/reportsFilterUtils';

const ACCOUNT_TABS = [
  { value: 'all', label: 'All accounts' },
  { value: 'self', label: 'Self' }
];

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' }
];

const ReportsFilters = ({
  filters,
  setFilters,
  filtersExpanded,
  setFiltersExpanded,
  categories = [],
  subcategories = [],
  hasAdvancedFilters,
  hasAnyFilters,
  onClearAll,
  onExportTransactions,
  onExportSubscriptions
}) => {
  const moreRef = useRef(null);
  const dateLabel = formatReportsDateRangeLabel(filters);

  useEffect(() => {
    if (!filtersExpanded) return undefined;

    const onDocClick = (e) => {
      const target = e.target;
      if (moreRef.current?.contains(target)) return;
      if (target.closest?.('.react-datepicker-popper')) return;
      if (target.closest?.('.react-datepicker')) return;
      if (target.closest?.('[role="menu"]')) return;
      setFiltersExpanded(false);
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [filtersExpanded, setFiltersExpanded]);

  const datePickerPopperClass = 'reports-filters-datepicker-popper';
  const dateCalendarClass =
    'modal-glass-datepicker__calendar modal-glass-datepicker__calendar--compact';
  const monthCalendarClass = `${dateCalendarClass} reports-filters-month-picker__calendar`;

  const filteredSubs = subcategories.filter(
    (sc) =>
      !filters.categoryId ||
      sc.categoryId?._id === filters.categoryId ||
      sc.categoryId === filters.categoryId
  );

  return (
    <div
      className={`glass-panel reports-filters ${
        filtersExpanded ? 'reports-filters--popover-open' : ''
      }`.trim()}
    >
      <div className="reports-page__header">
        <div>
          <h1 className="reports-page__title">Reports</h1>
          <p className="reports-page__subtitle">See your financial overview at a glance.</p>
        </div>
      </div>

      <div className="reports-filters__bar">
        <div className="reports-filters__tabs" role="tablist" aria-label="Account scope">
          {ACCOUNT_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filters.account === tab.value}
              className={`reports-filters__tab ${
                filters.account === tab.value ? 'reports-filters__tab--active' : ''
              }`}
              onClick={() => setFilters({ ...filters, account: tab.value })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="reports-filters__date-chip" title="Active period">
          {dateLabel}
        </span>

        <div className="reports-filters__bar-end">
          {hasAnyFilters ? (
            <button type="button" className="reports-filters__clear" onClick={onClearAll}>
              Clear all
            </button>
          ) : null}

          <div className="reports-filters__more-wrap" ref={moreRef}>
            <button
              type="button"
              className={`reports-filters__filter-btn ${
                filtersExpanded ? 'reports-filters__filter-btn--open' : ''
              } ${hasAdvancedFilters ? 'reports-filters__filter-btn--active' : ''}`}
              onClick={() => setFiltersExpanded((v) => !v)}
              aria-expanded={filtersExpanded}
              aria-haspopup="true"
            >
              {filtersExpanded ? (
                <>
                  Filter <ChevronUp size={14} strokeWidth={2} />
                </>
              ) : (
                <>
                  Filter
                  {hasAdvancedFilters ? ' · On' : ''}
                  <ChevronDown size={14} strokeWidth={2} />
                </>
              )}
            </button>

            {filtersExpanded ? (
              <div className="reports-filters__popover" role="dialog" aria-label="Report filters">
                <p className="reports-filters__popover-title">Filter reports</p>
                <div className="reports-filters__popover-grid">
                  <label className="reports-filters__field">
                    <span className="reports-filters__label">Month</span>
                    <DatePicker
                      glass
                      selected={filters.month}
                      onChange={(date) =>
                        setFilters({ ...filters, month: date, startDate: '', endDate: '' })
                      }
                      placeholder="Select month"
                      showMonthYearPicker
                      wrapperClassName="reports-filters__datepicker"
                      calendarClassName={monthCalendarClass}
                      popperClassName={datePickerPopperClass}
                    />
                  </label>
                  <label className="reports-filters__field">
                    <span className="reports-filters__label">Type</span>
                    <Select
                      glass
                      value={filters.type || ''}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      options={TYPE_OPTIONS}
                    />
                  </label>
                  <label className="reports-filters__field">
                    <span className="reports-filters__label">Start date</span>
                    <DatePicker
                      glass
                      selected={filters.startDate}
                      onChange={(date) =>
                        setFilters({ ...filters, startDate: date, month: '' })
                      }
                      placeholder="Start"
                      wrapperClassName="reports-filters__datepicker"
                      calendarClassName={dateCalendarClass}
                      popperClassName={datePickerPopperClass}
                    />
                  </label>
                  <label className="reports-filters__field">
                    <span className="reports-filters__label">End date</span>
                    <DatePicker
                      glass
                      selected={filters.endDate}
                      onChange={(date) =>
                        setFilters({ ...filters, endDate: date, month: '' })
                      }
                      placeholder="End"
                      wrapperClassName="reports-filters__datepicker"
                      calendarClassName={dateCalendarClass}
                      popperClassName={datePickerPopperClass}
                    />
                  </label>
                  <label className="reports-filters__field reports-filters__field--wide">
                    <span className="reports-filters__label">Category</span>
                    <Select
                      glass
                      value={filters.categoryId || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          categoryId: e.target.value,
                          subCategoryId: ''
                        })
                      }
                      options={[
                        { value: '', label: 'All categories' },
                        ...categories.map((c) => ({ value: c._id, label: c.name }))
                      ]}
                    />
                  </label>
                  <label className="reports-filters__field reports-filters__field--wide">
                    <span className="reports-filters__label">Subcategory</span>
                    <Select
                      glass
                      value={filters.subCategoryId || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, subCategoryId: e.target.value })
                      }
                      disabled={!filters.categoryId}
                      options={[
                        { value: '', label: 'All subcategories' },
                        ...filteredSubs.map((s) => ({
                          value: s._id,
                          label: s.name
                        }))
                      ]}
                    />
                  </label>
                </div>

                <div className="reports-filters__popover-footer">
                  <div className="reports-filters__exports">
                    <Button variant="secondary" glass type="button" onClick={onExportTransactions}>
                      <Download size={14} />
                      Export transactions
                    </Button>
                    <Button variant="secondary" glass type="button" onClick={onExportSubscriptions}>
                      <Download size={14} />
                      Export subscriptions
                    </Button>
                  </div>
                  <button type="button" className="reports-filters__clear" onClick={onClearAll}>
                    Clear all
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
