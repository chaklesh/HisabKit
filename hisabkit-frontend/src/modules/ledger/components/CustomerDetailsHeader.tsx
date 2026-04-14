/**
 * CustomerDetailsHeader component
 * Shows selected customer info and quick action buttons
 * ~100 lines
 */

import { Edit, Plus, MessageCircleMore, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer } from '../types/ledgerTypes';

interface CustomerDetailsHeaderProps {
  customer: Customer | null;
  onEdit: () => void;
  onAddSale: () => void;
  onAddPayment: () => void;
  onSendSMS: () => void;
  onSendWhatsApp: () => void;
  smsLink: string;
  whatsappLink: string;
}

export function CustomerDetailsHeader({
  customer,
  onEdit,
  onAddSale,
  onAddPayment,
  onSendSMS,
  onSendWhatsApp,
  smsLink,
  whatsappLink,
}: CustomerDetailsHeaderProps) {
  if (!customer) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">{customer.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{customer.phone || customer.email || 'No contact available'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>

          <Button variant="outline" size="sm" onClick={onAddSale} className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Sale
          </Button>

          <Button variant="outline" size="sm" onClick={onAddPayment} className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Payment
          </Button>

          {smsLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendSMS}
              asChild
              className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <a href={smsLink} target="_blank" rel="noopener noreferrer">
                <MessageSquareText className="mr-1 h-3.5 w-3.5" />
                SMS
              </a>
            </Button>
          )}

          {whatsappLink && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendWhatsApp}
              asChild
              className="border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircleMore className="mr-1 h-3.5 w-3.5" />
                WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
