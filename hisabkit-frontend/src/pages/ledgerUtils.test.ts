import { csvCell, formatCurrency, formatDate, monthStart, today } from '../shared/utils/ledgerUtils';

describe('ledgerUtils', () => {
  it('today returns yyyy-mm-dd', () => {
    const value = today();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('monthStart returns first date of current month', () => {
    const value = monthStart();
    expect(value.endsWith('-01')).toBe(true);
  });

  it('formatCurrency formats INR values', () => {
    expect(formatCurrency(1234.5)).toContain('1,234.5');
  });

  it('formatDate returns localized date string', () => {
    const formatted = formatDate('2026-04-12T10:00:00.000Z');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('csvCell escapes double quotes', () => {
    expect(csvCell('a"b')).toBe('"a""b"');
  });
});
