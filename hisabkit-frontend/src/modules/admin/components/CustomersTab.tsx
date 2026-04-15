import { Plus, Trash2, UserX, Search, Phone, MapPin } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';
import type { Customer, CustomerCreateState, CustomerFormState } from '../types/adminTypes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
          <h2 className="text-2xl font-black text-foreground dark:text-white">Customer accounts</h2>
          <p className="text-sm text-muted-foreground">
            {selectedTenantName ? `Managing accounts for ${selectedTenantName}` : 'Select a tenant to begin.'}
          </p>
        </div>
        <Button 
          onClick={resetCustomerEdit} 
          className="rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Search by name, contact, OR GST number..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Customer List */}
        <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto pr-2 custom-scrollbar">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-muted-foreground transition-all hover:bg-muted/50">
              <div className="p-4 rounded-full bg-background shadow-sm border border-border">
                <UserX className="h-10 w-10 opacity-40 text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">No customers found</p>
                <p className="text-xs">Try adjusting your search or add a new customer.</p>
              </div>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                onClick={() => openCustomerEdit(customer)}
                className={cn(
                  "group relative transition-all cursor-pointer rounded-2xl border border-border overflow-hidden",
                  customerEdit.id === customer.id
                    ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/5"
                    : "bg-background hover:border-primary/50 hover:shadow-sm"
                )}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-colors",
                      customerEdit.id === customer.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {customer.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{customer.name}</h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        {customer.phone && (
                          <span className="flex items-center text-[11px] text-muted-foreground">
                            <Phone className="w-3 h-3 mr-1" /> {customer.phone}
                          </span>
                        )}
                        <span className="flex items-center text-[11px] font-bold text-primary">
                           {formatCurrency(Number(customer.totalBalance || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); removeCustomer(customer.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right: Form Panel */}
        <div className="sticky top-0 h-fit space-y-4">
          <Card className="rounded-3xl border-border bg-background shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="outline" className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
                    {isEditing ? 'Editing Profile' : 'New Registration'}
                  </Badge>
                  <CardTitle className="text-lg font-black text-foreground">
                    {isEditing ? 'Update details' : 'Add new customer'}
                  </CardTitle>
                </div>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={resetCustomerEdit} className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg">
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Full Name *</label>
                <Input
                  value={isEditing ? customerEdit.name : customerCreate.name}
                  onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, name: e.target.value})) : setCustomerCreate(p => ({...p, name: e.target.value}))}
                  placeholder="e.g. John Doe"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Phone</label>
                   <Input
                     value={isEditing ? customerEdit.phone : customerCreate.phone}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, phone: e.target.value})) : setCustomerCreate(p => ({...p, phone: e.target.value}))}
                     placeholder="+91..."
                     className="rounded-xl"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Email</label>
                   <Input
                     value={isEditing ? customerEdit.email : customerCreate.email}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, email: e.target.value})) : setCustomerCreate(p => ({...p, email: e.target.value}))}
                     placeholder="john@example.com"
                     className="rounded-xl"
                   />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Address</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
                   <textarea
                     value={isEditing ? customerEdit.address : customerCreate.address}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, address: e.target.value})) : setCustomerCreate(p => ({...p, address: e.target.value}))}
                     placeholder="Full business address..."
                     rows={2}
                     className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 resize-none"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">GST Number</label>
                   <Input
                     value={isEditing ? customerEdit.gstNumber : customerCreate.gstNumber}
                     onChange={(e) => isEditing ? setCustomerEdit(p => ({...p, gstNumber: e.target.value})) : setCustomerCreate(p => ({...p, gstNumber: e.target.value}))}
                     placeholder="22AAAAA0000A1Z5"
                     className="rounded-xl"
                   />
                </div>
              </div>

              <Button 
                onClick={isEditing ? saveCustomerEdit : createCustomer}
                disabled={!(isEditing ? customerEdit.name.trim() : customerCreate.name.trim())}
                className="w-full h-12 rounded-xl mt-4 bg-primary hover:bg-primary/90 transition-all font-bold shadow-indigo-200 dark:shadow-none"
              >
                {isEditing ? 'Save changes' : 'Register customer'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
