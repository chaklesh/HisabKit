import * as React from "react";
import { format, isSameDay, startOfMonth, endOfMonth, subDays, subMonths, startOfQuarter } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, Clock, RefreshCcw } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@hisabkit/lib/utils";
import { Button } from "@hisabkit/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@hisabkit/ui/components/DropdownMenu";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (!startDate && !endDate) return undefined;
    return {
      from: startDate ? new Date(startDate) : undefined,
      to: endDate ? new Date(endDate) : undefined,
    };
  });

  // Sync internal state with props
  React.useEffect(() => {
    if (!startDate && !endDate) {
      setDate(undefined);
    } else {
      setDate({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      });
    }
  }, [startDate, endDate]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onChange(format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd"));
    } else if (!range) {
      onChange("", "");
    }
  };

  const presets = [
    { label: "Today", from: new Date(), to: new Date() },
    { label: "Last 7 Days", from: subDays(new Date(), 7), to: new Date() },
    { label: "Last 30 Days", from: subDays(new Date(), 30), to: new Date() },
    { label: "This Month", from: startOfMonth(new Date()), to: new Date() },
    { label: "Last Month", from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) },
    { label: "This Quarter", from: startOfQuarter(new Date()), to: new Date() },
  ];

  const activePreset = presets.find(p => 
    date?.from && date?.to && 
    isSameDay(p.from, date.from) && 
    isSameDay(p.to, date.to)
  );

  return (
    <div className="grid gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm",
              !date && "text-slate-500",
              date && "text-indigo-600 border-indigo-100 bg-indigo-50/30"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y") + " - " + format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Date Filter</span>
            )}
            <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[calc(100vw-2rem)] md:w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-950 z-[100]" 
          align="end"
          sideOffset={8}
        >
          <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto custom-scrollbar">
            {/* Presets Column */}
            <div className="w-full md:w-[130px] bg-slate-50/80 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-2 space-y-1">
              <p className="px-2 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Quick Select</p>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                {presets.map((p) => {
                  const isActive = activePreset?.label === p.label;
                  return (
                    <button
                      key={p.label}
                      onClick={() => handleSelect({ from: p.from, to: p.to })}
                      className={cn(
                        "text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between group",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={cn("w-3 h-3", isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100")} />
                        {p.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleSelect(undefined)}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2"
                >
                  <RefreshCcw className="w-3 h-3" />
                  Reset Filter
                </button>
              </div>
            </div>

            {/* Calendar Column */}
            <div className="p-2 flex justify-center">
              <style>{`
                .rdp {
                  --rdp-cell-size: 32px;
                  --rdp-accent-color: #4f46e5;
                  --rdp-background-color: #f1f5f9;
                  --rdp-accent-color-foreground: #ffffff;
                  --rdp-range-middle-color: #eef2ff;
                  --rdp-range-middle-text: #4f46e5;
                  margin: 0;
                }
                .dark .rdp {
                  --rdp-accent-color: #6366f1;
                  --rdp-background-color: #1e293b;
                  --rdp-accent-color-foreground: #ffffff;
                  --rdp-range-middle-color: rgba(99, 102, 241, 0.15);
                  --rdp-range-middle-text: #a5b4fc;
                }
                .rdp-day_selected, .rdp-day_selected:focus, .rdp-day_selected:hover {
                  background-color: var(--rdp-accent-color) !important;
                  color: var(--rdp-accent-color-foreground) !important;
                  border-radius: 6px;
                }
                .rdp-day_range_middle {
                  background-color: var(--rdp-range-middle-color) !important;
                  color: var(--rdp-range-middle-text) !important;
                  border-radius: 0;
                }
                .rdp-day_range_start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
                .rdp-day_range_end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
                
                .rdp-day:hover:not(.rdp-day_selected) {
                  background-color: var(--rdp-background-color) !important;
                }
                .rdp-head_cell {
                  font-size: 9px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: #94a3b8;
                }
                .rdp-caption_label {
                  font-size: 11px;
                  font-weight: 800;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                .rdp-nav_button { color: #64748b; }
                .rdp-day { font-weight: 600; font-size: 10px; }
              `}</style>
              <DayPicker
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={1}
                className="rounded-3xl"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
