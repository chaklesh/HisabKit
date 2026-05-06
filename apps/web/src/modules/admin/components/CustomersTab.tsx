import { CustomerFormBody } from "@/shared/components/ledgers/CustomerFormBody";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@hisabkit/ui/components/Card";
import { Input } from "@hisabkit/ui/components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Plus, Save, Search, Trash2, UserPlus, UserX } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "../../../shared/utils/ledgerUtils";
import type { Customer } from "../types/adminTypes";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  gstNumber: z.string().max(15).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof customerSchema>;

import type { CustomerCreateState, CustomerFormState } from "../types/adminTypes";

interface CustomersTabProps {
  selectedTenantName?: string;
  customers: Customer[];
  filteredCustomers: Customer[];
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  customerEdit: CustomerFormState;
  customerCreate: CustomerCreateState;
  setCustomerCreate: Dispatch<SetStateAction<CustomerCreateState>>;
  createCustomer: () => Promise<boolean>;
  removeCustomer: (id: string) => Promise<boolean>;
  saveCustomerEdit: () => Promise<boolean>;
  resetCustomerEdit: () => void;
  resetCustomerCreate: () => void;
  openCustomerEdit: (c: Customer) => void;
  setCustomerEdit: Dispatch<SetStateAction<CustomerFormState>>;
}

export function CustomersTab({
  selectedTenantName,
  filteredCustomers,
  customerSearch,
  setCustomerSearch,
  customerEdit,
  createCustomer,
  removeCustomer,
  saveCustomerEdit,
  resetCustomerEdit,
  openCustomerEdit,
  setCustomerEdit,
  setCustomerCreate,
}: CustomersTabProps) {
  const isEditing = Boolean(customerEdit.id);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      gstNumber: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      reset({
        name: customerEdit.name,
        phone: customerEdit.phone,
        email: customerEdit.email,
        address: customerEdit.address,
        gstNumber: customerEdit.gstNumber,
        dueDate: customerEdit.dueDate,
      });
    } else {
      reset({
        name: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        dueDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [customerEdit, isEditing, reset]);

  const onFormSubmit = (data: FormValues) => {
    if (isEditing) {
      setCustomerEdit((prev: CustomerFormState) => ({ ...prev, ...data }));
      setTimeout(() => saveCustomerEdit(), 0);
    } else {
      setCustomerCreate((prev: CustomerCreateState) => ({ ...prev, ...data }));
      setTimeout(() => createCustomer(), 0);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground dark:text-white">Customer accounts</h2>
          <p className="text-sm text-muted-foreground">
            {selectedTenantName
              ? `Managing accounts for ${selectedTenantName}`
              : "Select a tenant to begin."}
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
            filteredCustomers.map((customer: Customer) => (
              <Card
                key={customer.id}
                onClick={() => openCustomerEdit(customer)}
                className={cn(
                  "group relative transition-all cursor-pointer rounded-2xl border border-border overflow-hidden",
                  customerEdit.id === customer.id
                    ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/5"
                    : "bg-background hover:border-primary/50 hover:shadow-sm",
                )}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-colors",
                        customerEdit.id === customer.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomer(customer.id);
                      }}
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
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-background shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge
                    variant="outline"
                    className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30"
                  >
                    {isEditing ? "Editing Profile" : "New Registration"}
                  </Badge>
                  <CardTitle className="text-lg font-black text-foreground">
                    {isEditing ? "Update details" : "Add new customer"}
                  </CardTitle>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetCustomerEdit}
                    className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>

            <form
              id="customer-form"
              onSubmit={handleSubmit(onFormSubmit)}
              className="p-6 pt-0 space-y-4"
            >
              <CustomerFormBody
                register={register}
                errors={errors}
                dateInputRef={dateInputRef}
                isEditing={isEditing}
              />

              <Button
                type="submit"
                disabled={!isValid}
                className="w-full h-12 rounded-xl mt-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                {isEditing ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Save Changes" : "Register Customer"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
