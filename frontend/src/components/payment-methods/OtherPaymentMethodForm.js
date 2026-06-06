import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Select from '../ui/Select';
import Button from '../ui/Button';
import PaymentMethodLogo from './PaymentMethodLogo';
import { detectPaymentLogo } from '../../services/paymentLogoService';
import {
  PAYMENT_BANKS,
  PAYMENT_BANK_OTHER
} from '../../constants/paymentBanks';
import { getOtherDetailLabel } from '../../utils/paymentMethodDisplay';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const TYPE_OPTIONS = [
  { value: 'digital_wallet', label: 'Digital wallet' },
  { value: 'bank', label: 'Bank & transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' }
];

const emptyState = (type = 'digital_wallet') => ({
  name: '',
  type,
  icon: 'mdi:wallet-outline',
  identifier: '',
  bankKey: '',
  bankOtherQuery: '',
  bankName: '',
  bankLogoUrl: '',
  bankDomain: '',
  logoUrl: ''
});

const OtherPaymentMethodForm = ({ editing, initial, preset, onSubmit, onCancel }) => {
  const [form, setForm] = useState(() => emptyState(preset?.type || 'digital_wallet'));
  const debouncedName = useDebouncedValue(form.name, 400);
  const debouncedBankOther = useDebouncedValue(form.bankOtherQuery, 400);

  useEffect(() => {
    if (preset && !initial) {
      setForm((prev) => ({
        ...emptyState(preset.type || 'digital_wallet'),
        name: preset.name || '',
        icon: preset.icon || 'mdi:wallet-outline',
        type: preset.type || 'digital_wallet'
      }));
      return;
    }
    if (!initial) return;
    const meta = initial.metadata || {};
    setForm({
      name: initial.name || '',
      type: initial.type || 'other',
      icon: initial.icon || 'mdi:wallet-outline',
      identifier: meta.identifier || '',
      bankKey: meta.bankName
        ? PAYMENT_BANKS.find((b) => b.name === meta.bankName)
          ? meta.bankName
          : PAYMENT_BANK_OTHER
        : '',
      bankOtherQuery:
        meta.bankName && !PAYMENT_BANKS.find((b) => b.name === meta.bankName)
          ? meta.bankName
          : '',
      bankName: meta.bankName || '',
      bankLogoUrl: meta.bankLogoUrl || '',
      bankDomain: meta.bankDomain || '',
      logoUrl: initial.icon?.startsWith('http') ? initial.icon : ''
    });
  }, [initial, preset]);

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
          icon: res.data.logoUrl
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedName, editing]);

  useEffect(() => {
    if (form.bankKey !== PAYMENT_BANK_OTHER || !debouncedBankOther.trim()) return;
    let cancelled = false;
    (async () => {
      const res = await detectPaymentLogo(debouncedBankOther.trim());
      if (cancelled) return;
      if (res.data?.recognized) {
        setForm((prev) => ({
          ...prev,
          bankName: res.data.brandName || debouncedBankOther.trim(),
          bankLogoUrl: res.data.logoUrl || '',
          bankDomain: res.data.domain || ''
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          bankName: debouncedBankOther.trim(),
          bankLogoUrl: '',
          bankDomain: ''
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedBankOther, form.bankKey]);

  const handleBankSelect = async (bankKey) => {
    if (bankKey === PAYMENT_BANK_OTHER) {
      setForm((prev) => ({
        ...prev,
        bankKey,
        bankName: '',
        bankLogoUrl: '',
        bankDomain: ''
      }));
      return;
    }
    const bank = PAYMENT_BANKS.find((b) => b.name === bankKey);
    if (!bank) {
      setForm((prev) => ({ ...prev, bankKey: bankKey || '', bankName: '', bankLogoUrl: '' }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      bankKey: bank.name,
      bankName: bank.name,
      bankDomain: bank.domain,
      bankOtherQuery: ''
    }));
    const res = await detectPaymentLogo(bank.name);
    if (res.data?.recognized && res.data.logoUrl) {
      setForm((prev) => ({
        ...prev,
        bankLogoUrl: res.data.logoUrl,
        bankDomain: res.data.domain || bank.domain
      }));
    }
  };

  const showIdentifier = form.type !== 'cash';
  const showBank = form.type !== 'cash';
  const bankRequired = form.type === 'bank';
  const identifierLabel = getOtherDetailLabel(form.type, form.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    if (showIdentifier && !form.identifier.trim()) return;
    if (bankRequired && !form.bankName.trim()) return;

    const icon = form.logoUrl || form.icon || 'mdi:wallet-outline';
    const detailLabel = showIdentifier ? identifierLabel : '';

    const metadata = {};
    if (showIdentifier && form.identifier.trim()) {
      metadata.identifier = form.identifier.trim();
    }
    if (showBank && form.bankName.trim()) {
      metadata.bankName = form.bankName.trim();
      if (form.bankLogoUrl) metadata.bankLogoUrl = form.bankLogoUrl;
      if (form.bankDomain) metadata.bankDomain = form.bankDomain;
    }

    onSubmit({
      name,
      icon,
      type: form.type,
      detailLabel: detailLabel || null,
      metadata: Object.keys(metadata).length ? metadata : null
    });
  };

  const canSubmit =
    form.name.trim() &&
    (!showIdentifier || form.identifier.trim()) &&
    (!bankRequired || form.bankName.trim());

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Type *</Form.Label>
        <Select
          value={form.type}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, type: e.target.value }))
          }
          options={TYPE_OPTIONS}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Name *</Form.Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="pm-logo-plain pm-logo-plain--lg">
            <PaymentMethodLogo
              icon={form.logoUrl || form.icon}
              fallbackIcon="mdi:wallet-outline"
              size={28}
            />
          </div>
          <Form.Control
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Google Pay, PhonePe, Cash"
            required
            style={{ flex: 1 }}
          />
        </div>
      </Form.Group>

      {showIdentifier && (
        <Form.Group className="mb-3">
          <Form.Label>{identifierLabel} *</Form.Label>
          <Form.Control
            type="text"
            value={form.identifier}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, identifier: e.target.value }))
            }
            placeholder="e.g. user@upi"
            required
          />
        </Form.Group>
      )}

      {showBank && (
        <Form.Group className="mb-3">
          <Form.Label>
            Linked bank{bankRequired ? ' *' : ' (optional)'}
          </Form.Label>
          <Select
            value={form.bankKey || ''}
            onChange={(e) => handleBankSelect(e.target.value)}
            options={[
              { value: '', label: 'None' },
              ...PAYMENT_BANKS.map((b) => ({ value: b.name, label: b.name })),
              { value: PAYMENT_BANK_OTHER, label: 'Other…' }
            ]}
          />
          {form.bankKey === PAYMENT_BANK_OTHER && (
            <Form.Control
              className="mt-2"
              type="text"
              value={form.bankOtherQuery}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bankOtherQuery: e.target.value }))
              }
              placeholder="Search bank name"
            />
          )}
        </Form.Group>
      )}

      <div className="modal-glass__actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!canSubmit}>
          {editing ? 'Update method' : 'Add method'}
        </Button>
      </div>
    </Form>
  );
};

export default OtherPaymentMethodForm;
