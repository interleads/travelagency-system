
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth, subDays, startOfYear, endOfYear, subMonths } from "date-fns";
import { useDashboardDateRange } from "./useDashboardDateRange";

const PRESETS = [
  {
    label: "Todo o período",
    getRange: () => ({
      from: undefined,
      to: undefined,
    }),
  },
  {
    label: "Últimos 7 dias",
    getRange: () => {
      const today = new Date();
      return {
        from: subDays(today, 6),
        to: today,
      };
    },
  },
  {
    label: "Este mês",
    getRange: () => {
      const today = new Date();
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };
    },
  },
  {
    label: "Mês passado",
    getRange: () => {
      const today = new Date();
      const lastMonthDate = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonthDate),
        to: endOfMonth(lastMonthDate),
      };
    },
  },
  {
    label: "Este ano",
    getRange: () => {
      const today = new Date();
      return {
        from: startOfYear(today),
        to: endOfYear(today),
      };
    },
  },
  {
    label: "Personalizado",
    getRange: null, // Marca que vai usar o seletor manual
  },
];

export default function DashboardFilters() {
  const dashRange = useDashboardDateRange();
  const dateRange = dashRange?.dateRange || { from: undefined, to: undefined };
  const setDateRange = dashRange?.setDateRange || (() => {});

  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState(
    () =>
      !PRESETS.some(
        (preset) =>
          preset.getRange &&
          JSON.stringify(preset.getRange()) ===
            JSON.stringify({ from: dateRange.from, to: dateRange.to })
      )
  );

  const [selectedPreset, setSelectedPreset] = React.useState(() => {
    const found = PRESETS.findIndex(
      (preset) =>
        preset.getRange &&
        JSON.stringify(preset.getRange()) ===
          JSON.stringify({ from: dateRange.from, to: dateRange.to })
    );
    return found === -1 ? PRESETS.length - 1 : found; // Personalizado se não bater
  });

  // Quando escolher um preset, atualize o intervalo
  function handlePresetClick(idx: number) {
    setSelectedPreset(idx);
    setCustom(idx === PRESETS.length - 1);
    const preset = PRESETS[idx];
    if (preset.getRange) {
      setDateRange(preset.getRange());
    }
  }

  // Quando datas forem mudadas manualmente, marque como "Personalizado"
  function handleCustomRange(range) {
    setDateRange(range);
    setSelectedPreset(PRESETS.length - 1);
    setCustom(true);
  }

  const formatted =
    dateRange.from && dateRange.to
      ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
      : "Período";

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-[240px] justify-start text-left font-normal"
            aria-label="Selecionar período"
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{formatted}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col gap-2 p-2">
            <div className="flex flex-col gap-1 min-w-[140px]">
              {PRESETS.map((preset, idx) => (
                <Button
                  key={preset.label}
                  variant={idx === selectedPreset ? "default" : "ghost"}
                  className="justify-start text-xs sm:text-sm"
                  onClick={() => handlePresetClick(idx)}
                  tabIndex={0}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className={`${custom ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-50"} transition-all`}>
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={handleCustomRange}
                numberOfMonths={1}
                className="p-3 pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" />
        <span className="sm:inline">Exportar</span>
      </Button>
    </div>
  );
}

