import React, { useState, useEffect, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import Select from '../ui/Select';
import Button from '../ui/Button';
import MiniCardVisual from './MiniCardVisual';
import PaymentMethodLogo from './PaymentMethodLogo';
import { cardNetworkFromPrefix } from '../../utils/cardNetworkFromPrefix';
import { detectPaymentLogo } from '../../services/paymentLogoService';
import {
  PAYMENT_BANKS,
  PAYMENT_BANK_OTHER
} from '../../constants/paymentBanks';
import {
  buildCardDetailLabel,
  buildCardDisplayName
} from '../../utils/paymentMethodDisplay';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const emptyState = () => ({
  last4: '',
  nickname: '',
  cardRole: 'credit',
  network: '',
  networkLabel: '',
  networkLogoUrl: '',
  networkFallbackIcon: 'mdi:credit-card-outline',
  bankKey: '',
  bankOtherQuery: '',
  bankName: '',
  bankLogoUrl: '',
  bankDomain: ''
});

const CardPaymentMethodForm = ({ editing, initial, onSubmit, onCancel }) => {
  const [first4, setFirst4] = useState('');
  const [detectingNetwork, setDetectingNetwork] = useState(false);
  const [networkHint, setNetworkHint] = useState('');
  const [form, setForm] = useState(emptyState);
  const debouncedBankOther = useDebouncedValue(form.bankOtherQuery, 400);

  useEffect(() => {
    if (!initial) return;
    const meta = initial.metadata || {};
    setForm({
      last4: meta.last4 || '',
      nickname: initial.name?.includes('·')
        ? initial.name.split('·')[0].trim()
        : initial.name || '',
      cardRole: meta.cardRole || 'credit',
      network: meta.network || '',
      networkLabel: meta.network || '',
      networkLogoUrl: meta.networkLogoUrl || (initial.icon?.startsWith('http') ? initial.icon : ''),
      networkFallbackIcon: 'mdi:credit-card-outline',
      bankKey: meta.bankName
        ? PAYMENT_BANKS.find((b) => b.name === meta.bankName)
          ? meta.bankName
          : PAYMENT_BANK_OTHER
        : '',
      bankOtherQuery: meta.bankName && !PAYMENT_BANKS.find((b) => b.name === meta.bankName)
        ? meta.bankName
        : '',
      bankName: meta.bankName || '',
      bankLogoUrl: meta.bankLogoUrl || '',
      bankDomain: meta.bankDomain || ''
    });
  }, [initial]);

  const runNetworkDetect = useCallback(async (searchTerm, hint) => {
    setDetectingNetwork(true);
    setNetworkHint('');
    try {
      const res = await detectPaymentLogo(searchTerm);
      const data = res.data;
      if (data?.recognized && data.logoUrl) {
        setForm((prev) => ({
          ...prev,
          network: hint.network,
          networkLabel: hint.label,
          networkLogoUrl: data.logoUrl,
          networkFallbackIcon: hint.fallbackIcon
        }));
        setFirst4('');
        setNetworkHint(`Detected ${hint.label}`);
      } else {
        setForm((prev) => ({
          ...prev,
          network: hint.network,
          networkLabel: hint.label,
          networkLogoUrl: '',
          networkFallbackIcon: hint.fallbackIcon
        }));
        setNetworkHint('');
      }
    } finally {
      setDetectingNetwork(false);
    }
  }, []);

  const handleFirst4Blur = () => {
    const hint = cardNetworkFromPrefix(first4);
    if (!hint) {
      setNetworkHint('');
      return;
    }
    runNetworkDetect(hint.network, hint);
  };

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
      setForm((prev) => ({ ...prev, bankKey: bankKey || '' }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const last4 = form.last4.replace(/\D/g, '').slice(-4);
    if (last4.length !== 4) return;

    const icon =
      form.networkLogoUrl || form.networkFallbackIcon || 'mdi:credit-card-outline';
    const name = buildCardDisplayName({
      nickname: form.nickname,
      networkLabel: form.networkLabel,
      cardRole: form.cardRole
    });

    onSubmit({
      name,
      icon,
      type: 'card',
      detailLabel: buildCardDetailLabel(last4),
      metadata: {
        last4,
        cardRole: form.cardRole,
        network: form.network || form.networkLabel,
        networkLogoUrl: form.networkLogoUrl || undefined,
        bankName: form.bankName || undefined,
        bankLogoUrl: form.bankLogoUrl || undefined,
        bankDomain: form.bankDomain || undefined
      }
    });
  };

  const last4Valid = form.last4.replace(/\D/g, '').length === 4;
  const previewLast4 = form.last4.replace(/\D/g, '').slice(-4) || '0000';

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>First 4 digits (detect network only)</Form.Label>
        <Form.Control
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={first4}
          onChange={(e) =>
            setFirst4(e.target.value.replace(/\D/g, '').slice(0, 4))
          }
          onBlur={handleFirst4Blur}
          placeholder="e.g. 4532"
          autoComplete="off"
        />
        <div className="card-form-hint">
          Used only to detect card network. Cleared after detection — never saved.
        </div>
        {(detectingNetwork || networkHint) && (
          <div className="card-form-detect">
            {detectingNetwork && <Icon icon="mdi:loading" className="spin" />}
            {networkHint}
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last 4 digits *</Form.Label>
        <Form.Control
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={form.last4}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              last4: e.target.value.replace(/\D/g, '').slice(0, 4)
            }))
          }
          placeholder="8482"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Card nickname (optional)</Form.Label>
        <Form.Control
          type="text"
          value={form.nickname}
          onChange={(e) => setForm((prev) => ({ ...prev, nickname: e.target.value }))}
          placeholder="e.g. Personal"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Card type *</Form.Label>
        <Select
          value={form.cardRole}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, cardRole: e.target.value }))
          }
          options={[
            { value: 'credit', label: 'Credit' },
            { value: 'debit', label: 'Debit' }
          ]}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Issuing bank</Form.Label>
        <Select
          value={form.bankKey || ''}
          onChange={(e) => handleBankSelect(e.target.value)}
          options={[
            { value: '', label: 'Select bank…' },
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

      <div className="card-form-preview">
        <MiniCardVisual
          network={form.network}
          networkFallbackIcon={form.networkFallbackIcon}
          bankLogoUrl={form.bankLogoUrl}
        />
        <div className="card-form-preview__meta">
          <div style={{ fontWeight: 600, color: '#111827' }}>
            {buildCardDisplayName({
              nickname: form.nickname,
              networkLabel: form.networkLabel,
              cardRole: form.cardRole
            })}
          </div>
          <div>•••• {previewLast4}</div>
          {form.bankName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <PaymentMethodLogo
                icon={form.bankLogoUrl || 'mdi:bank-outline'}
                size={16}
              />
              {form.bankName}
            </div>
          )}
        </div>
      </div>

      <div className="modal-glass__actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!last4Valid}>
          {editing ? 'Update card' : 'Add card'}
        </Button>
      </div>
    </Form>
  );
};

export default CardPaymentMethodForm;
