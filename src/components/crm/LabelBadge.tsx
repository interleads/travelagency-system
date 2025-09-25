import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Label {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'teal' | 'pink';
}

interface LabelBadgeProps {
  label: Label;
  className?: string;
}

const colorVariants = {
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  teal: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
  pink: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
};

export const LabelBadge: React.FC<LabelBadgeProps> = ({ label, className }) => {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium border",
        colorVariants[label.color],
        className
      )}
    >
      {label.name}
    </Badge>
  );
};