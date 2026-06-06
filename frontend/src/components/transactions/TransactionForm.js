import React, { useMemo } from 'react';
import { Form } from 'react-bootstrap';
import Button from '../ui/Button';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import { getMutedTagColor } from '../../utils/tagStatsUtils';
import { getPaymentMethodPreviewInfo } from '../../utils/paymentMethodDisplay';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' }
];

const TransactionForm = ({
  formData,
  setFormData,
  categories,
  subcategories,
  tags,
  paymentMethods,
  isDuplicate,
  editing,
  onSubmit,
  onCancel
}) => {
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === formData.type),
    [categories, formData.type]
  );

  const filteredSubcategories = useMemo(
    () =>
      subcategories.filter(
        (sc) =>
          sc.categoryId?._id === formData.categoryId || sc.categoryId === formData.categoryId
      ),
    [subcategories, formData.categoryId]
  );

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((pm) => String(pm._id) === String(formData.paymentMethodId)),
    [paymentMethods, formData.paymentMethodId]
  );

  const paymentPreview = useMemo(
    () => getPaymentMethodPreviewInfo(selectedPaymentMethod),
    [selectedPaymentMethod]
  );

  const toggleTag = (tagId) => {
    setFormData((prev) => {
      const has = prev.tags.includes(tagId);
      return {
        ...prev,
        tags: has ? prev.tags.filter((id) => id !== tagId) : [...prev.tags, tagId]
      };
    });
  };

  return (
    <Form className="txn-form modal-glass__form" onSubmit={onSubmit}>
      <section className="txn-form__section">
        <h4 className="txn-form__section-title">Essentials</h4>
        <div className="txn-form__type-tabs" role="group" aria-label="Transaction type">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`txn-form__type-tab txn-form__type-tab--${opt.value} ${
                formData.type === opt.value ? 'txn-form__type-tab--active' : ''
              }`}
              onClick={() =>
                setFormData({
                  ...formData,
                  type: opt.value,
                  categoryId: '',
                  subCategoryId: ''
                })
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="txn-form__grid txn-form__grid--3">
          <div className="txn-form__field txn-form__field--amount">
            <Form.Label>Amount *</Form.Label>
            <Form.Control
              type="number"
              step="any"
              min="0.01"
              className="txn-form__amount-input"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="txn-form__field">
            <Form.Label>Date *</Form.Label>
            <DatePicker
              glass
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              placeholder="Select date"
              required
              wrapperClassName="glass-content-datepicker"
              calendarClassName="modal-glass-datepicker__calendar modal-glass-datepicker__calendar--compact"
              popperClassName="glass-content-datepicker-popper modal-glass-datepicker-popper"
            />
          </div>
          <div className="txn-form__field">
            <Form.Label>Account</Form.Label>
            <Select
              glass
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              options={[
                { value: 'self', label: 'Self' },
                { value: 'family', label: 'Family' }
              ]}
            />
          </div>
        </div>
        {isDuplicate ? (
          <p className="txn-form__hint">Date is set to today; other fields copied from the original.</p>
        ) : null}
      </section>

      <section className="txn-form__section">
        <h4 className="txn-form__section-title">Classification</h4>
        <div className="txn-form__grid txn-form__grid--2">
          <div className="txn-form__field">
            <Form.Label>Category</Form.Label>
            <Select
              glass
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })
              }
              options={[
                { value: '', label: 'Select category' },
                ...filteredCategories.map((cat) => ({
                  value: cat._id,
                  label: cat.name
                }))
              ]}
            />
          </div>
          <div className="txn-form__field">
            <Form.Label>Subcategory</Form.Label>
            <Select
              glass
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
              disabled={!formData.categoryId}
              options={[
                { value: '', label: 'Select subcategory' },
                ...filteredSubcategories.map((sub) => ({
                  value: sub._id,
                  label: sub.name
                }))
              ]}
            />
          </div>
        </div>
      </section>

      <section className="txn-form__section">
        <h4 className="txn-form__section-title">Payment</h4>
        <div className="txn-form__grid txn-form__grid--2 txn-form__grid--payment">
          <div className="txn-form__field">
            <Form.Label>Payment method</Form.Label>
            <Select
              glass
              value={formData.paymentMethodId}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethodId: e.target.value })
              }
              options={[
                { value: '', label: 'None' },
                ...paymentMethods.map((pm) => ({ value: pm._id, label: pm.name }))
              ]}
            />
          </div>
          <div className="txn-form__field">
            <Form.Label className="txn-form__label--visually-muted">Details</Form.Label>
            {selectedPaymentMethod ? (
              <div className="txn-form__pm-preview" aria-live="polite">
                <span className="txn-form__pm-preview-logo">
                  <PaymentMethodLogo icon={selectedPaymentMethod.icon} size={24} />
                </span>
                <div className="txn-form__pm-preview-body">
                  <p className="txn-form__pm-preview-name">{selectedPaymentMethod.name}</p>
                  {paymentPreview.identifierLine ? (
                    <p className="txn-form__pm-preview-id">{paymentPreview.identifierLine}</p>
                  ) : paymentPreview.typeLabel ? (
                    <p className="txn-form__pm-preview-muted">{paymentPreview.typeLabel}</p>
                  ) : null}
                  {paymentPreview.bankName ? (
                    <div className="txn-form__pm-preview-bank">
                      <PaymentMethodLogo
                        icon={paymentPreview.bankLogoUrl || 'mdi:bank-outline'}
                        fallbackIcon="mdi:bank-outline"
                        size={16}
                      />
                      <span>{paymentPreview.bankName}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="txn-form__pm-preview-empty">Choose a payment method to see saved details.</p>
            )}
          </div>
        </div>
      </section>

      {tags.length > 0 ? (
        <section className="txn-form__section">
          <h4 className="txn-form__section-title">Tags</h4>
          <div className="txn-form__tags">
            {tags.map((tag) => {
              const active = formData.tags.includes(tag._id);
              return (
                <button
                  key={tag._id}
                  type="button"
                  className={`txn-form__tag ${active ? 'txn-form__tag--active' : ''}`}
                  style={
                    active
                      ? {
                          color: tag.color || '#5b21b6',
                          backgroundColor: getMutedTagColor(tag.color),
                          borderColor: tag.color ? `${tag.color}66` : 'rgba(124, 58, 237, 0.45)'
                        }
                      : undefined
                  }
                  onClick={() => toggleTag(tag._id)}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="txn-form__section txn-form__section--notes">
        <h4 className="txn-form__section-title">Notes</h4>
        <Form.Control
          as="textarea"
          rows={3}
          className="txn-form__notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional description or memo…"
        />
      </section>

      <div className="modal-glass__actions txn-form__actions">
        <Button variant="secondary" glass type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" glass type="submit">
          {editing ? 'Save changes' : isDuplicate ? 'Create duplicate' : 'Create transaction'}
        </Button>
      </div>
    </Form>
  );
};

export default TransactionForm;
