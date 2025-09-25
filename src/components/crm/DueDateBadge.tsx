import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface DueDateBadgeProps {
  dueDate: Date;
  className?: string;
  showIcon?: boolean;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({ 
  dueDate, 
  className,
  showIcon = true 
}) => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  
  // Determine status and styling
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let icon = Calendar;
  let colorClasses = '';
  
  if (isBefore(dueDate, today)) {
    // Overdue - red
    variant = 'destructive';
    icon = AlertTriangle;
    colorClasses = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
  } else if (isToday(dueDate)) {
    // Due today - orange
    icon = Clock;
    colorClasses = 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
  } else if (isBefore(dueDate, tomorrow)) {
    // Due tomorrow - yellow
    colorClasses = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
  } else if (isBefore(dueDate, nextWeek)) {
    // Due this week - blue
    colorClasses = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
  } else {
    // Due later - green
    colorClasses = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
  }
  
  const IconComponent = icon;
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium border flex items-center gap-1",
        colorClasses,
        className
      )}
    >
      {showIcon && <IconComponent size={10} />}
      {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}
    </Badge>
  );
};