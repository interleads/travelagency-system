import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealValueBadgeProps {
  value: number;
  currency?: string;
  className?: string;
  showIcon?: boolean;
}

export const DealValueBadge: React.FC<DealValueBadgeProps> = ({ 
  value, 
  currency = 'R$',
  className,
  showIcon = true 
}) => {
  // Format the value based on its size
  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    } else {
      return val.toLocaleString('pt-BR');
    }
  };

  // Determine color based on value ranges
  const getValueColor = (val: number) => {
    if (val >= 50000) {
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'; // High value - green
    } else if (val >= 20000) {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'; // Good value - blue
    } else if (val >= 10000) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'; // Medium value - yellow
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'; // Low value - gray
    }
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium border flex items-center gap-1",
        getValueColor(value),
        className
      )}
    >
      {showIcon && <DollarSign size={10} />}
      {currency} {formatValue(value)}
    </Badge>
  );
};