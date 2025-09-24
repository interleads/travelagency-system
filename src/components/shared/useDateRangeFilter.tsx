import React from "react";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateRangeFilterContext = React.createContext<DateRangeFilterContextType | undefined>(undefined);

export function useDateRangeFilter() {
  const context = React.useContext(DateRangeFilterContext);
  if (!context) throw new Error("useDateRangeFilter must be used within DateRangeFilterProvider");
  return context;
}

export const DateRangeFilterProvider = ({children}: {children: React.ReactNode}) => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined
  });

  return (
    <DateRangeFilterContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeFilterContext.Provider>
  );
};