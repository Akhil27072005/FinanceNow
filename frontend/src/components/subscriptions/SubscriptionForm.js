import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Button from '../ui/Button';
import Select from '../ui/Select';
import DatePicker from '../ui/DatePicker';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';
import { detectPaymentLogo } from '../../services/paymentLogoService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const emptyForm = () => ({
  name: '',
  amount: '',
  categoryId: '',
  billingCycle: 'monthly',
  nextPaymentDate: '',
  paymentMethodId: '',
  paymentMethodDetail: '',
  isActive: true,
  autoRenew: true,
  metadata: null,
  logoUrl: ''
});

const SubscriptionForm = ({ editing, initial, categories, paymentMethods, onSubmit, onCancel }) => {
  const [form, setForm] = useState(emptyForm);
  const debouncedName = useDebouncedValue(form.name, 400);

  useEffect(() => {
    if (!initial) {
      setForm(emptyForm());
      return;
    }
    const meta = initial.metadata || {};
    setForm({
      name: initial.name || '',
      amount: String(initial.amount ?? ''),
      categoryId: initial.categoryId?._id || initial.categoryId || '',
      billingCycle: initial.billingCycle || 'monthly',
      nextPaymentDate: initial.nextPaymentDate
        ? new Date(initial.nextPaymentDate).toISOString().split('T')[0]
        : '',
      paymentMethodId: initial.paymentMethodId?._id || initial.paymentMethodId || '',
      paymentMethodDetail: initial.paymentMethodDetail || '',
      isActive: initial.isActive !== false,
      autoRenew: initial.autoRenew !== false,
      metadata: meta.logoUrl ? meta : null,
      logoUrl: meta.logoUrl || ''
    });
  }, [initial]);

  useEffect(() => {
    if (!debouncedName.trim() || editing) return;
    let cancelled = false;
    (async () => {
      const res = await detectPaymentLogo(debouncedName.trim());
      if (cancelled) return;
      if (res.data?.recognized && res.data.logoUrl) {
        setForm((prev) => ({
          ...prev,
          logoUrl: res.data.logoUrl,
          metadata: {
            logoUrl: res.data.logoUrl,
            brandName: res.data.brandName || debouncedName.trim(),
            brandDomain: res.data.domain || ''
          }
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedName, editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      categoryId: form.categoryId || null,
      billingCycle: form.billingCycle,
      nextPaymentDate: form.nextPaymentDate,
      paymentMethodId: form.paymentMethodId || null,
      paymentMethodDetail: form.paymentMethodDetail || null,
      isActive: form.isActive,
      autoRenew: form.autoRenew,
      metadata: form.metadata
    };
    onSubmit(payload);
  };

  const logoPreview = form.logoUrl || form.metadata?.logoUrl;

  return (
    <Form className="modal-glass__form" onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="subscription-row__logo" style={{ width: 44, height: 44 }}>
            {logoPreview ? (
              <PaymentMethodLogo icon={logoPreview} size={28} />
            ) : (
              <span className="subscription-row__logo--letter">
                {(form.name || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Netflix, Spotify"
            required
            style={{ flex: 1 }}
          />
        </div>
      </Form.Group>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Amount *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              required
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Billing cycle *</Form.Label>
            <Select
              value={form.billingCycle}
              onChange={(e) => setForm((prev) => ({ ...prev, billingCycle: e.target.value }))}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
              required
            />
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Next payment date *</Form.Label>
            <DatePicker
              selected={form.nextPaymentDate}
              onChange={(date) => setForm((prev) => ({ ...prev, nextPaymentDate: date }))}
              placeholder="Select date"
              calendarClassName="modal-glass-datepicker__calendar modal-glass-datepicker__calendar--compact"
              required
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Select
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              options={[
                { value: '', label: 'None' },
                ...categories.map((c) => ({ value: c._id, label: c.name }))
              ]}
            />
          </Form.Group>
        </div>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Payment method</Form.Label>
        <Select
          value={form.paymentMethodId}
          onChange={(e) => setForm((prev) => ({ ...prev, paymentMethodId: e.target.value }))}
          options={[
            { value: '', label: 'None' },
            ...paymentMethods.map((pm) => ({ value: pm._id, label: pm.name }))
          ]}
        />
      </Form.Group>

      <div className="row">
        <div className="col-md-6">
          <Form.Check
            type="switch"
            label="Active"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
        </div>
        <div className="col-md-6">
          <Form.Check
            type="switch"
            label="Auto renew"
            checked={form.autoRenew}
            onChange={(e) => setForm((prev) => ({ ...prev, autoRenew: e.target.checked }))}
          />
        </div>
      </div>

      <div className="modal-glass__actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {editing ? 'Update subscription' : 'Add subscription'}
        </Button>
      </div>
    </Form>
  );
};

export default SubscriptionForm;
