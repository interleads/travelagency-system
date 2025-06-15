
import React from "react";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DashboardDateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DashboardDateRangeContext = React.createContext<DashboardDateRangeContextType | undefined>(undefined);

export function useDashboardDateRange() {
  const context = React.useContext(DashboardDateRangeContext);
  if (!context) throw new Error("useDashboardDateRange must be used within DashboardDateRangeProvider");
  return context;
}

export const DashboardDateRangeProvider = ({children}: {children: React.ReactNode}) => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined
  });

  return (
    <DashboardDateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DashboardDateRangeContext.Provider>
  );
};
