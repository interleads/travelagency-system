
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useDashboardDateRange } from "./useDashboardDateRange";

export default function DashboardFilters() {
  const { dateRange, setDateRange } = useDashboardDateRange();
  const [open, setOpen] = React.useState(false);

  const formatted =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
      : "Período";

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[220px] justify-start text-left font-normal"
            aria-label="Selecionar período"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{formatted}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            selected={dateRange}
            onSelect={range => setDateRange({ from: range?.from, to: range?.to })}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      <Button>
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
    </div>
  );
}
