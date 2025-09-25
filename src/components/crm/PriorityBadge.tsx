import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig = {
  low: {
    label: 'Baixa',
    icon: ArrowDown,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
  },
  medium: {
    label: 'Média',
    icon: Minus,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
  },
  high: {
    label: 'Alta',
    icon: ArrowUp,
    className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
  },
  urgent: {
    label: 'Urgente',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
  }
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  className,
  showIcon = true 
}) => {
  const config = priorityConfig[priority];
  const IconComponent = config.icon;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium border flex items-center gap-1",
        config.className,
        className
      )}
    >
      {showIcon && <IconComponent size={10} />}
      {config.label}
    </Badge>
  );
};