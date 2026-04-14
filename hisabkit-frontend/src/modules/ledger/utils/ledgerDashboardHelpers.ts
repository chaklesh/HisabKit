import type { Attachment } from '../../../shared/types/domain';
import type { Customer } from '../types/ledgerTypes';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';

export const detectAttachmentType = (attachment: Attachment): 'image' | 'pdf' | 'other' => {
  const fileType = (attachment.fileType || '').toLowerCase();
  const name = (attachment.fileName || '').toLowerCase();
  if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(name)) return 'image';
  if (fileType.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  return 'other';
};

export const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  values.push(current.trim());
  return values;
};

export const buildReminderMessage = ({
  template,
  selectedCustomer,
  businessName,
}: {
  template?: string;
  selectedCustomer: Customer | null;
  businessName?: string;
}): string => {
  if (!selectedCustomer) {
    return 'Please review your ledger balance in HisabKit.';
  }

  const balance = Number(selectedCustomer.totalBalance || 0);
  const vars = {
    customerName: selectedCustomer.name,
    balance: formatCurrency(Math.abs(balance)),
    balanceType: balance >= 0 ? 'to pay' : 'to receive',
    businessName: businessName || 'our business',
    customerPhone: selectedCustomer.phone || '',
  };

  if (!template) {
    return `Hi ${vars.customerName}, this is a reminder from ${vars.businessName}. Your current balance is ${vars.balance} (${vars.balanceType}). Please settle when possible.`;
  }

  return template
    .split('{{customerName}}').join(vars.customerName)
    .split('{{balance}}').join(vars.balance)
    .split('{{balanceType}}').join(vars.balanceType)
    .split('{{businessName}}').join(vars.businessName)
    .split('{{customerPhone}}').join(vars.customerPhone);
};
