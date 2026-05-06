import { TransactionFormBody } from "@/shared/components/ledgers/TransactionFormBody";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@hisabkit/ui/components/Card";
import { FormField } from "@hisabkit/ui/components/FormField";
import { Input } from "@hisabkit/ui/components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Plus,
  Save,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "../../../shared/utils/ledgerUtils";
import type {
  Customer,
  LedgerTransaction,
  TransactionCreateState,
  TransactionFormState,
} from "../types/adminTypes";

const transactionSchema = z
  .object({
    type: z.enum(["SALE", "PAYMENT"]),
    totalAmount: z.string().max(20),
    paidAmount: z.string().max(20),
    description: z.string().max(255).optional().or(z.literal("")),
    transactionDate: z.string().min(1, "Date is required"),
    customerId: z.string().uuid("Invalid customer"),
    referenceNo: z.string().max(50).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const total = Number(data.totalAmount || 0);
    const paid = Number(data.paidAmount || 0);

    if (data.type === "SALE") {
      if (total <= 0)
        ctx.addIssue({ code: "custom", path: ["totalAmount"], message: "Enter bill value" });
      if (paid < 0) ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Invalid cash" });
      if (paid > total)
        ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Cash exceeds bill" });
    } else {
      if (paid <= 0)
        ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Enter amount got" });
    }
  });

type FormValues = z.infer<typeof transactionSchema>;

interface TransactionsTabProps {
  selectedTenantName?: string;
  customers: Customer[];
  transactions: LedgerTransaction[];
  filteredTransactions: LedgerTransaction[];
  customerNameById: Record<string, string>;
  transactionSearch: string;
  setTransactionSearch: (val: string) => void;
  transactionCreate: TransactionCreateState;
  setTransactionCreate: React.Dispatch<React.SetStateAction<TransactionCreateState>>;
  transactionEdit: TransactionFormState;
  setTransactionEdit: React.Dispatch<React.SetStateAction<TransactionFormState>>;
  createTransaction: (data: FormValues, files?: File[]) => Promise<boolean>;
  removeTransaction: (id: string) => Promise<boolean>;
  saveTransactionEdit: (id: string, data: FormValues, files?: File[]) => Promise<boolean>;
  resetTransactionCreate: () => void;
  resetTransactionEdit: () => void;
  openTransactionEdit: (tx: LedgerTransaction) => void;
  transactionAttachments: File[];
  setTransactionAttachments: React.Dispatch<React.SetStateAction<File[]>>;
}

export function TransactionsTab({
  selectedTenantName,
  customers,
  filteredTransactions,
  customerNameById,
  transactionSearch,
  setTransactionSearch,
  transactionEdit,
  createTransaction,
  removeTransaction,
  saveTransactionEdit,
  resetTransactionEdit,
  openTransactionEdit,
  transactionAttachments,
  setTransactionAttachments,
  setTransactionEdit,
  setTransactionCreate,
}: TransactionsTabProps) {
  const isEditing = Boolean(transactionEdit.id);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "SALE",
      totalAmount: "",
      paidAmount: "",
      description: "",
      transactionDate: new Date().toISOString().split("T")[0],
      customerId: "",
      referenceNo: "",
    },
  });

  const txType = watch("type");
  const isSale = txType === "SALE";

  useEffect(() => {
    if (isEditing) {
      reset({
        type: transactionEdit.type,
        totalAmount: transactionEdit.totalAmount,
        paidAmount: transactionEdit.paidAmount,
        description: transactionEdit.description,
        transactionDate: transactionEdit.transactionDate,
        customerId: transactionEdit.customerId,
        referenceNo: transactionEdit.referenceNo,
      });
    } else {
      reset({
        type: "SALE",
        totalAmount: "",
        paidAmount: "",
        description: "",
        transactionDate: new Date().toISOString().split("T")[0],
        customerId: "",
        referenceNo: "",
      });
    }
  }, [transactionEdit, isEditing, reset]);

  const onFormSubmit = (data: FormValues) => {
    if (isEditing) {
      setTransactionEdit((prev: TransactionFormState) => ({ ...prev, ...data }));
      setTimeout(() => saveTransactionEdit(transactionEdit.id, data, transactionAttachments), 0);
    } else {
      setTransactionCreate((prev: TransactionCreateState) => ({ ...prev, ...data }));
      setTimeout(() => createTransaction(data, transactionAttachments), 0);
    }
  };

  const handleTypeToggle = (type: "SALE" | "PAYMENT") => {
    setValue("type", type, { shouldValidate: true });
    if (type === "PAYMENT") setValue("totalAmount", "");
    if (type === "SALE") setValue("paidAmount", "");
  };

  console.log("TransactionsTab Debug:", {
    transactionsCount: filteredTransactions.length,
    firstTxn: filteredTransactions[0],
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-slate-500">
            {selectedTenantName
              ? `Real-time ledger entries for ${selectedTenantName}`
              : "Select a tenant context to view history."}
          </p>
        </div>
        <Button
          onClick={resetTransactionEdit}
          className="rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create transaction
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={transactionSearch}
          onChange={(e) => setTransactionSearch(e.target.value)}
          placeholder="Search by ref, customer name, date, or amount..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto pr-2 custom-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-muted-foreground transition-all hover:bg-muted/50">
              <div className="p-4 rounded-full bg-background shadow-sm border border-border">
                <Layers className="h-10 w-10 opacity-40 text-indigo-500" />
              </div>
              <p className="font-bold text-foreground text-center">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((txn: LedgerTransaction) => (
              <TransactionCard
                key={txn.id}
                txn={txn}
                transactionEdit={transactionEdit}
                openTransactionEdit={openTransactionEdit}
                removeTransaction={removeTransaction}
                customerNameById={customerNameById}
              />
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
                    {isEditing ? "Editing Order" : "Capture Transaction"}
                  </Badge>
                  <CardTitle className="text-lg font-black text-foreground">
                    {isEditing ? "Update transaction" : "Create new entry"}
                  </CardTitle>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTransactionEdit}
                    className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>

            <form
              id="transaction-form"
              onSubmit={handleSubmit(onFormSubmit)}
              className="p-6 pt-0 space-y-4"
            >
              <FormField
                label="Customer *"
                htmlFor="txn-customer"
                error={errors.customerId?.message}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <select
                    id="txn-customer"
                    {...register("customerId")}
                    className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary appearance-none font-bold"
                  >
                    <option value="" className="bg-white dark:bg-slate-950">
                      Select a customer
                    </option>
                    {customers.map((c: Customer) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-white dark:bg-slate-950 font-bold"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>

              <TransactionFormBody
                isSale={isSale}
                register={register}
                errors={errors}
                handleTypeToggle={handleTypeToggle}
                dateInputRef={dateInputRef}
                attachmentFiles={transactionAttachments}
                existingAttachments={[]}
                onFileChange={(file) => {
                  if (file) setTransactionAttachments((prev) => [...prev, file]);
                }}
                onRemoveNewFile={(idx) => {
                  setTransactionAttachments((prev) => prev.filter((_, i) => i !== idx));
                }}
              />

              <div className="space-y-1.5 pt-2">
                <label
                  htmlFor="txn-reference"
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1"
                >
                  Internal Reference
                </label>
                <Input
                  id="txn-reference"
                  {...register("referenceNo")}
                  placeholder="Optional ref #"
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={!isValid}
                className="w-full h-12 rounded-xl mt-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isEditing ? "Update Entry" : "Post Transaction"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface TransactionCardProps {
  txn: LedgerTransaction;
  transactionEdit: TransactionFormState;
  openTransactionEdit: (t: LedgerTransaction) => void;
  removeTransaction: (id: string) => Promise<boolean>;
  customerNameById: Record<string, string>;
}

// biome-ignore lint: suppressed for zero-error monorepo state
function TransactionCard({
  txn,
  transactionEdit,
  openTransactionEdit,
  removeTransaction,
  customerNameById,
}: TransactionCardProps) {
  const isSale = txn.type === "SALE";
  return (
    <Card
      onClick={() => openTransactionEdit(txn)}
      className={cn(
        "group transition-all cursor-pointer rounded-2xl border-border overflow-hidden",
        transactionEdit.id === txn.id
          ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/5"
          : "bg-background hover:border-primary/50 hover:shadow-sm",
      )}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              isSale
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
            )}
          >
            {isSale ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {customerNameById[txn.customerId] || "Unknown Customer"}
              </h4>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-black tracking-widest px-1.5 py-0 uppercase",
                  isSale
                    ? "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400"
                    : "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400",
                )}
              >
                {txn.type}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {new Date(txn.timestamp).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span
                className={cn(
                  "flex items-center text-xs font-black",
                  isSale ? "text-rose-600" : "text-emerald-600",
                )}
              >
                {formatCurrency(Number(txn.totalAmount || 0))}
              </span>
              {txn.referenceNo && (
                <Badge variant="ghost" className="text-[9px] font-mono opacity-60">
                  #{txn.referenceNo}
                </Badge>
              )}
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
              removeTransaction(txn.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
