import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const InvestmentsTransactionPanel = ({
  holdings = [],
  selectedHoldingId,
  investmentCategories = [],
  onSelectHolding,
  onAddHolding,
  onUpdateCategory,
  onSubmitActivity,
  onViewHistory,
  submitting = false,
  updatingCategory = false
}) => {
  const { formatCurrency } = useUserFormatters();
  const [panelMode, setPanelMode] = useState('add');
  const [investedAmount, setInvestedAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [fieldError, setFieldError] = useState('');

  const selected = holdings.find((h) => String(h.id) === String(selectedHoldingId));

  const holdingOptions = useMemo(
    () => [
      { value: '', label: 'Select holding…' },
      ...holdings.map((h) => ({
        value: String(h.id),
        label: h.displayName
      }))
    ],
    [holdings]
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Select category…' },
      ...investmentCategories.map((cat) => ({
        value: String(cat._id),
        label: cat.name
      }))
    ],
    [investmentCategories]
  );

  useEffect(() => {
    setSelectedCategoryId(selected?.categoryId ? String(selected.categoryId) : '');
  }, [selected?.id, selected?.categoryId]);

  const handleCategoryChange = async (value) => {
    setSelectedCategoryId(value);
    if (!selectedHoldingId) return;
    await onUpdateCategory?.(selectedHoldingId, value || null);
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    await onAddHolding?.({
      displayName: name,
      assetKey: newSymbol.trim() || name,
      assetType: 'stock_etf',
      categoryId: newCategoryId || null
    });
    setNewName('');
    setNewSymbol('');
    setNewCategoryId('');
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setFieldError('');

    if (!selectedHoldingId) {
      setFieldError('Select a holding first');
      return;
    }

    if (panelMode === 'set') {
      const num = Number(investedAmount);
      if (!Number.isFinite(num) || num < 0) {
        setFieldError('Enter a valid amount (0 or more)');
        return;
      }
      await onSubmitActivity({
        mode: 'set_position',
        holdingId: selectedHoldingId,
        value: num,
        date
      });
      setInvestedAmount('');
    } else {
      const num = Number(addAmount);
      if (!Number.isFinite(num) || num <= 0) {
        setFieldError('Enter an amount greater than 0');
        return;
      }
      await onSubmitActivity({
        mode: 'add_contribution',
        holdingId: selectedHoldingId,
        amount: num,
        date
      });
      setAddAmount('');
    }
  };

  return (
    <div className="investments-panel glass-panel">
      <h2 className="investments-panel__title">Update investment</h2>

      <div className="investments-segment" role="tablist">
        <button
          type="button"
          role="tab"
          className={`investments-segment__btn ${
            panelMode === 'add' ? 'investments-segment__btn--active' : ''
          }`}
          onClick={() => {
            setPanelMode('add');
            setFieldError('');
          }}
        >
          Add amount
        </button>
        <button
          type="button"
          role="tab"
          className={`investments-segment__btn ${
            panelMode === 'set' ? 'investments-segment__btn--active' : ''
          }`}
          onClick={() => {
            setPanelMode('set');
            setFieldError('');
          }}
        >
          Set total invested
        </button>
      </div>

      <div className="investments-field">
        <label htmlFor="holding-select">Holding</label>
        <Select
          glass
          id="holding-select"
          value={selectedHoldingId ? String(selectedHoldingId) : ''}
          onChange={(e) => onSelectHolding?.(e.target.value || null)}
          options={holdingOptions}
          placeholder="Select holding…"
          disabled={submitting}
        />
        {selected ? (
          <div className="investments-panel__selected-meta">
            <p className="investments-panel__current-total">
              Current total:{' '}
              <strong>
                {formatCurrency(selected.totalCostBasis ?? selected.totalInvested ?? 0)}
              </strong>
            </p>
            <button
              type="button"
              className="investments-holding-row__history"
              onClick={() => onViewHistory?.(selected)}
            >
              History
            </button>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="investments-field">
          <label htmlFor="holding-category">Category</label>
          <Select
            glass
            id="holding-category"
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            options={categoryOptions}
            disabled={submitting || updatingCategory || investmentCategories.length === 0}
          />
          {investmentCategories.length === 0 ? (
            <p className="investments-field__hint">
              No investment categories yet.{' '}
              <Link to="/categories" className="investments-panel__link">
                Create categories
              </Link>{' '}
              with type Investment.
            </p>
          ) : (
            <p className="investments-field__hint">
              Classifies this holding and tags new investment transactions.
            </p>
          )}
        </div>
      ) : null}

      <div className="investments-field">
        <button
          type="button"
          className="investments-panel__add-stock"
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? 'Cancel' : '+ Add new holding'}
        </button>
        {showAddForm && (
          <form className="investments-panel__add-form" onSubmit={handleAddHolding}>
            <div className="investments-field">
              <label htmlFor="new-name">Name</label>
              <input
                id="new-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Apple, HDFC Flexi Cap"
                disabled={submitting}
                required
              />
            </div>
            <div className="investments-field">
              <label htmlFor="new-symbol">Symbol / code (optional)</label>
              <input
                id="new-symbol"
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="e.g. AAPL"
                disabled={submitting}
              />
            </div>
            <div className="investments-field">
              <label htmlFor="new-category">Category (optional)</label>
              <Select
                glass
                id="new-category"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                options={categoryOptions}
                disabled={submitting || investmentCategories.length === 0}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              glass
              size="sm"
              disabled={submitting || !newName.trim()}
            >
              Add holding
            </Button>
          </form>
        )}
      </div>

      <form className="investments-panel__activity-form" onSubmit={handleSubmit}>
        {panelMode === 'set' ? (
          <div className="investments-field">
            <label htmlFor="set-invested">Total amount invested</label>
            <input
              id="set-invested"
              type="number"
              min="0"
              step="any"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              disabled={!selected || submitting}
            />
            <p className="investments-field__hint">
              Replaces the current invested total for this holding.
            </p>
          </div>
        ) : (
          <div className="investments-field">
            <label htmlFor="contrib-amount">Amount to add</label>
            <input
              id="contrib-amount"
              type="number"
              min="0.01"
              step="any"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              disabled={!selected || submitting}
              placeholder="e.g. 5000"
            />
            <p className="investments-field__hint">
              Adds to the total and creates an investment transaction (account: self).
            </p>
          </div>
        )}

        <div className="investments-field">
          <label>Date</label>
          <DatePicker
            glass
            selected={date}
            onChange={(d) => setDate(d)}
            placeholder="Date"
            wrapperClassName="glass-content-datepicker investments-panel__datepicker"
            calendarClassName="modal-glass-datepicker__calendar modal-glass-datepicker__calendar--compact"
            popperClassName="glass-content-datepicker-popper modal-glass-datepicker-popper"
            disabled={submitting}
          />
        </div>

        {fieldError ? (
          <p className="investments-panel__field-error" role="alert">
            {fieldError}
          </p>
        ) : null}

        <Button
          variant="primary"
          glass
          type="submit"
          className="investments-panel__submit-btn"
          disabled={!selected || submitting}
          loading={submitting}
        >
          {panelMode === 'add' ? 'Add investment' : 'Save total'}
        </Button>
      </form>
    </div>
  );
};

export default InvestmentsTransactionPanel;
