import { Plus, Trash2, UserX, Search, Phone, MapPin, Calendar } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';
import type { Customer, CustomerCreateState, CustomerFormState } from '../types/adminTypes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

type CustomersTabProps = {
  selectedTenantName?: string;
  customers: Customer[];
  filteredCustomers: Customer[];
  customerSearch: string;
  setCustomerSearch: Dispatch<SetStateAction<string>>;
  customerCreate: CustomerCreateState;
  setCustomerCreate: Dispatch<SetStateAction<CustomerCreateState>>;
  customerEdit: CustomerFormState;
  setCustomerEdit: Dispatch<SetStateAction<CustomerFormState>>;
  createCustomer: () => void;
  removeCustomer: (customerId: string) => void;
  saveCustomerEdit: () => void;
  resetCustomerCreate: () => void;
  resetCustomerEdit: () => void;
  openCustomerEdit: (customer: Customer) => void;
};

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900 dark:border-slate-800';

export function CustomersTab({
  selectedTenantName,
  filteredCustomers,
  customerSearch,
  setCustomerSearch,
  customerCreate,
  setCustomerCreate,
  customerEdit,
  setCustomerEdit,
  createCustomer,
  removeCustomer,
  saveCustomerEdit,
  resetCustomerEdit,
  openCustomerEdit,
}: CustomersTabProps) {
  const isEditing = Boolean(customerEdit.id);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Customer accounts</h2>
          <p className="text-sm text-slate-500">
            {selectedTenantName ? `Managing accounts for ${selectedTenantName}` : 'Select a tenant to begin.'}
          </p>
        </div>
        <Button 
          onClick={resetCustomerEdit} 
          className="rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Search by name, contact, OR GST number..."
          className={cn(inputCls, "pl-10")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Customer List */}
        <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto pr-2 custom-scrollbar">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-slate-400 transition-all hover:bg-slate-50">
              <div className="p-4 rounded-full bg-white shadow-sm">
                <UserX className="h-10 w-10 opacity-40 text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600">No customers found</p>
                <p className="text-xs">Try adjusting your search or add a new customer.</p>
              </div>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => openCustomerEdit(customer)}
                className={cn(
                  "group relative flex items-center justify-between rounded-2xl border p-4 transition-all cursor-pointer",
                  customerEdit.id === customer.id
                    ? "border-indigo-500 bg-indigo-50/30 shadow-md ring-4 ring-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-colors",
                    customerEdit.id === customer.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {customer.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{customer.name}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {customer.phone && (
                        <span className="flex items-center text-[11px] text-slate-500">
                          <Phone className="w-3 h-3 mr-1" /> {customer.phone}
                        </span>
                      )}
                      <span className="flex items-center text-[11px] font-bold text-indigo-600">
                         {formatCurrency(Number(customer.totalBalance || 0))}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                    onClick={(e) => { e.stopPropagation(); removeCustomer(customer.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Form Panel */}
        <div className="sticky top-0 h-fit space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="outline" className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-indigo-100 bg-indigo-50">
                  {isEditing ? 'Editing Profile' : 'New Registration'}
                </Badge>
                <h3 className="text-lg font-black text-slate-900">
                  {isEditing ? 'Update details' : 'Add new customer'}
                </h3>
              </div>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={resetCustomerEdit} className="text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                  Cancel
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Full Name *</label>
                <input
                  value={isEditing ? customerEdit.name : customerCreate.name}
                  onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, name: e.target.value})) : setCustomerCreate(p => ({...p, name: e.target.value}))}
                  placeholder="e.g. John Doe"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Phone</label>
                   <input
                     value={isEditing ? customerEdit.phone : customerCreate.phone}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, phone: e.target.value})) : setCustomerCreate(p => ({...p, phone: e.target.value}))}
                     placeholder="+91..."
                     className={inputCls}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Email</label>
                   <input
                     value={isEditing ? customerEdit.email : customerCreate.email}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, email: e.target.value})) : setCustomerCreate(p => ({...p, email: e.target.value}))}
                     placeholder="john@example.com"
                     className={inputCls}
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Address</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                   <textarea
                     value={isEditing ? customerEdit.address : customerCreate.address}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, address: e.target.value})) : setCustomerCreate(p => ({...p, address: e.target.value}))}
                     placeholder="Full business address..."
                     rows={2}
                     className={cn(inputCls, "pl-9 resize-none py-2")}
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">GST Number</label>
                   <input
                     value={isEditing ? customerEdit.gstNumber : customerCreate.gstNumber}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, gstNumber: e.target.value})) : setCustomerCreate(p => ({...p, gstNumber: e.target.value}))}
                     placeholder="22AAAAA0000A1Z5"
                     className={inputCls}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Due Date</label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                     <input
                       type="date"
                       value={isEditing ? (customerEdit.dueDate || '') : (customerCreate.dueDate || '')}
                       onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, dueDate: e.target.value})) : setCustomerCreate(p => ({...p, dueDate: e.target.value}))}
                       className={cn(inputCls, "pl-9")}
                     />
                   </div>
                </div>
              </div>

              <Button 
                onClick={isEditing ? saveCustomerEdit : createCustomer}
                disabled={!(isEditing ? customerEdit.name.trim() : customerCreate.name.trim())}
                className="w-full h-12 rounded-xl mt-4 bg-slate-900 hover:bg-slate-800 transition-all font-bold"
              >
                {isEditing ? 'Save changes' : 'Register customer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
