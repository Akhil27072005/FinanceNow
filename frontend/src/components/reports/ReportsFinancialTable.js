import React from 'react';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const ROWS = [
  { key: 'totalIncome', label: 'Income', changeKey: 'totalIncome', positiveIsGood: true },
  { key: 'totalExpenses', label: 'Expenses', changeKey: 'totalExpenses', positiveIsGood: false },
  { key: 'netSavings', label: 'Net savings', changeKey: 'netSavings', positiveIsGood: true },
  { key: 'totalSavings', label: 'Savings', changeKey: 'totalSavings', positiveIsGood: true },
  { key: 'totalInvestments', label: 'Investment', changeKey: 'totalInvestments', positiveIsGood: true }
];

const ChangePill = ({ value, positiveIsGood }) => {
  if (value == null || Number.isNaN(value)) return <span className="reports-fin-table__pill reports-fin-table__pill--muted">—</span>;
  const positive = value >= 0;
  const good = positiveIsGood ? positive : !positive;
  return (
    <span
      className={`reports-fin-table__pill ${
        good ? 'reports-fin-table__pill--good' : 'reports-fin-table__pill--bad'
      }`}
    >
      {positive ? '+' : ''}
      {value}%
    </span>
  );
};

const ReportsFinancialTable = ({ kpis = {}, changes = {}, loading = false }) => {
  const { formatCurrency } = useUserFormatters();

  if (loading) {
    return (
      <div className="reports-fin-table glass-panel">
        <div className="reports-fin-table__skeleton-title" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="reports-fin-table__skeleton-row" />
        ))}
      </div>
    );
  }

  return (
    <div className="reports-fin-table glass-panel">
      <h2 className="reports-fin-table__title">Financial report</h2>
      <table className="reports-fin-table__table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key}>
              <td className="reports-fin-table__cat">{row.label}</td>
              <td className="reports-fin-table__amt">{formatCurrency(kpis[row.key] ?? 0)}</td>
              <td className="reports-fin-table__note">
                <ChangePill value={changes[row.changeKey]} positiveIsGood={row.positiveIsGood} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsFinancialTable;
