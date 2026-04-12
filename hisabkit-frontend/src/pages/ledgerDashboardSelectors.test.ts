import {
  applyDueDateMap,
  buildDueDateReport,
  computeTotals,
  countOverdueCustomers,
  filterAndSortCustomers,
} from './ledgerDashboardSelectors';

const baseCustomers = [
  { id: 'c1', name: 'Asha', totalBalance: 1200, phone: '9991112222' },
  { id: 'c2', name: 'Bhavesh', totalBalance: -200, email: 'b@example.com' },
  { id: 'c3', name: 'Chetan', totalBalance: 0 },
];

describe('ledgerDashboardSelectors', () => {
  it('applyDueDateMap merges due dates by id', () => {
    const result = applyDueDateMap(baseCustomers, { c1: '2026-04-20' });
    expect(result.find((c) => c.id === 'c1')?.dueDate).toBe('2026-04-20');
  });

  it('filterAndSortCustomers filters by contact', () => {
    const result = filterAndSortCustomers({
      customers: baseCustomers,
      searchTerm: '',
      customerFilter: 'WITH_CONTACT',
      customerSort: 'BY_NAME',
    });
    expect(result.length).toBe(2);
  });

  it('computeTotals calculates toCollect and toPay', () => {
    const totals = computeTotals(baseCustomers);
    expect(totals.toCollect).toBe(1200);
    expect(totals.toPay).toBe(200);
  });

  it('countOverdueCustomers counts customers with past due date', () => {
    const result = countOverdueCustomers([
      { id: 'c1', name: 'Asha', totalBalance: 100, dueDate: '2000-01-01' },
      { id: 'c2', name: 'Bhavesh', totalBalance: 100, dueDate: '2999-01-01' },
    ]);
    expect(result).toBe(1);
  });

  it('buildDueDateReport filters no due date', () => {
    const result = buildDueDateReport({
      customers: [
        { id: 'c1', name: 'Asha', totalBalance: 100, dueDate: '2026-04-20' },
        { id: 'c2', name: 'Bhavesh', totalBalance: 200 },
      ],
      reportSearchTerm: '',
      reportDueFilter: 'NO_DUE_DATE',
      reportSortField: 'NAME',
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bhavesh');
  });
});
