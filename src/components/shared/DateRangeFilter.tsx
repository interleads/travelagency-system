import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDateRangeFilter, type DateRange } from "./useDateRangeFilter";

const PRESETS = [
  {
    label: "Últimos 7 dias",
    getRange: () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from: weekAgo, to: today };
    }
  },
  {
    label: "Últimos 30 dias", 
    getRange: () => {
      const today = new Date();
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from: monthAgo, to: today };
    }
  },
  {
    label: "Este mês",
    getRange: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: firstDay, to: today };
    }
  },
  {
    label: "Personalizado",
    getRange: () => ({ from: undefined, to: undefined })
  }
];

export function DateRangeFilter() {
  const { dateRange, setDateRange } = useDateRangeFilter();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (idx: number) => {
    setSelectedPreset(idx);
    const range = PRESETS[idx].getRange();
    setDateRange(range);
    setIsCustom(idx === 3);
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setIsCustom(true);
      setSelectedPreset(3);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from) return "Selecionar período";
    if (!dateRange.to) return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="border-r">
            <div className="p-3 space-y-1">
              {PRESETS.map((preset, idx) => (
                <Button
                  key={preset.label}
                  variant={selectedPreset === idx ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm font-normal"
                  onClick={() => handlePresetClick(idx)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          {isCustom && (
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleCustomRange}
              numberOfMonths={2}
              className="p-3 pointer-events-auto"
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}