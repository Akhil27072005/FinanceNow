import React, { useCallback, useEffect, useState } from 'react';
import { portfolioService } from '../services/portfolioService';
import GlassAlert from '../components/ui/GlassAlert';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import InvestmentsKpiStrip from '../components/investments/InvestmentsKpiStrip';
import InvestmentsHoldingsTable from '../components/investments/InvestmentsHoldingsTable';
import InvestmentsTransactionPanel from '../components/investments/InvestmentsTransactionPanel';
import InvestmentsAllocation from '../components/investments/InvestmentsAllocation';
import InvestmentsRecentActivity from '../components/investments/InvestmentsRecentActivity';
import InvestmentsHoldingHistoryModal from '../components/investments/InvestmentsHoldingHistoryModal';
import '../styles/investments.css';

const normalizeId = (id) => (id == null || id === '' ? null : String(id));

const mergeHoldingIntoSummary = (prev, updatedHolding) => {
  if (!prev?.holdings || !updatedHolding?.id) return prev;

  const holdings = prev.holdings.map((h) =>
    String(h.id) === String(updatedHolding.id) ? { ...h, ...updatedHolding } : h
  );
  const totalInvested = holdings.reduce(
    (sum, h) => sum + (Number(h.totalCostBasis ?? h.totalInvested) || 0),
    0
  );
  const topHoldings = [...holdings]
    .sort((a, b) => (b.totalCostBasis ?? 0) - (a.totalCostBasis ?? 0))
    .slice(0, 3);

  return {
    ...prev,
    holdings,
    totalInvested,
    topHoldings,
    holdingCount: holdings.length
  };
};

const Investments = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedHoldingId, setSelectedHoldingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [historyHolding, setHistoryHolding] = useState(null);

  const loadSummary = useCallback(async ({ initial = false } = {}) => {
    try {
      if (initial) setLoading(true);
      else setRefreshing(true);
      setError('');
      const res = await portfolioService.getSummary();
      setSummary(res?.data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load portfolio');
      if (initial) setSummary(null);
    } finally {
      if (initial) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary({ initial: true });
  }, [loadSummary]);

  useEffect(() => {
    const holdings = summary?.holdings;
    if (!holdings?.length) {
      if (selectedHoldingId) setSelectedHoldingId(null);
      return;
    }

    const ids = holdings.map((h) => String(h.id));
    const current = normalizeId(selectedHoldingId);
    if (!current || !ids.includes(current)) {
      setSelectedHoldingId(ids[0]);
    }
  }, [summary?.holdings, selectedHoldingId]);

  const handleSelectHolding = (id) => {
    setSelectedHoldingId(normalizeId(id));
  };

  const resolveHolding = (holdingOrPartial) => {
    if (!holdingOrPartial?.id) return holdingOrPartial;
    const full = (summary?.holdings || []).find(
      (h) => String(h.id) === String(holdingOrPartial.id)
    );
    return full || holdingOrPartial;
  };

  const handleViewHistory = (holdingOrPartial) => {
    setHistoryHolding(resolveHolding(holdingOrPartial));
  };

  const handleAddHolding = async (holding) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await portfolioService.createHolding({
        displayName: holding.displayName,
        assetKey: holding.assetKey,
        assetType: holding.assetType || 'stock_etf'
      });
      const newId = res?.data?._id ?? res?.data?.id;
      if (newId) setSelectedHoldingId(String(newId));
      setSuccess(`${holding.displayName} added`);
      await loadSummary();
      setActivityRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add holding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivity = async (payload) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await portfolioService.createActivity(payload);
      const updatedHolding = res?.data?.holding;

      if (updatedHolding) {
        setSummary((prev) => mergeHoldingIntoSummary(prev, updatedHolding));
        if (historyHolding && String(historyHolding.id) === String(updatedHolding.id)) {
          setHistoryHolding((prev) => (prev ? { ...prev, ...updatedHolding } : prev));
        }
      } else {
        await loadSummary();
      }

      setSuccess(
        payload.mode === 'add_contribution'
          ? 'Investment recorded and transaction created'
          : 'Invested total updated'
      );
      setActivityRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await portfolioService.deleteHolding(deleteId);
      setSuccess('Holding removed');
      if (String(selectedHoldingId) === String(deleteId)) setSelectedHoldingId(null);
      if (String(historyHolding?.id) === String(deleteId)) setHistoryHolding(null);
      setDeleteId(null);
      await loadSummary();
      setActivityRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove holding');
    } finally {
      setSubmitting(false);
    }
  };

  const holdings = summary?.holdings || [];
  const topHolding = summary?.topHoldings?.[0] ?? null;

  return (
    <div className="investments-page">
      <header className="investments-page__header">
        <h1 className="investments-page__title">Investments</h1>
        <p className="investments-page__subtitle">
          Track invested amounts per stock or fund and log new contributions over time.
        </p>
      </header>

      {error && (
        <GlassAlert variant="danger" className="mb-3" onClose={() => setError('')}>
          {error}
        </GlassAlert>
      )}
      {success && (
        <GlassAlert variant="success" className="mb-3" onClose={() => setSuccess('')}>
          {success}
        </GlassAlert>
      )}

      <InvestmentsKpiStrip
        totalInvested={summary?.totalInvested}
        holdingCount={summary?.holdingCount ?? holdings.length}
        topHolding={topHolding}
        loading={loading}
      />

      <InvestmentsAllocation holdings={holdings} loading={loading} />

      <div className="investments-layout">
        <InvestmentsHoldingsTable
          holdings={holdings}
          loading={loading}
          selectedId={selectedHoldingId}
          onSelect={handleSelectHolding}
          onDelete={setDeleteId}
          onViewHistory={handleViewHistory}
        />
        <InvestmentsTransactionPanel
          holdings={holdings}
          selectedHoldingId={selectedHoldingId}
          onSelectHolding={handleSelectHolding}
          onAddHolding={handleAddHolding}
          onSubmitActivity={handleActivity}
          onViewHistory={handleViewHistory}
          submitting={submitting}
        />
      </div>

      <InvestmentsRecentActivity
        refreshKey={activityRefreshKey}
        onViewHoldingHistory={handleViewHistory}
      />

      {refreshing && !loading && (
        <p className="investments-page__refresh-hint" aria-live="polite">
          Updating totals…
        </p>
      )}

      <InvestmentsHoldingHistoryModal
        holding={historyHolding}
        isOpen={Boolean(historyHolding)}
        onClose={() => setHistoryHolding(null)}
        refreshKey={activityRefreshKey}
      />

      <ConfirmationModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Remove holding"
        message="Remove this holding from your portfolio? Its activity history will be deleted."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Investments;
