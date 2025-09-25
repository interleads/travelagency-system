import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ChecklistItem } from './ChecklistComponent';
import { Label as LabelType } from './LabelBadge';
import { LeadSource } from './LeadSourceBadge';
import { Priority } from './PriorityBadge';
import { cn } from "@/lib/utils";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  client: string;
  email: string;
  phone: string;
  labels: LabelType[];
  dueDate?: Date;
  checklist: ChecklistItem[];
  dealValue?: number;
  leadSource?: LeadSource;
  probability?: number;
  priority: Priority;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ColumnHeaderProps {
  title: string;
  cards: KanbanCard[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onColumnDragStart: (e: React.DragEvent, columnId: string) => void;
  onColumnDragOver: (e: React.DragEvent) => void;
  onColumnDrop: (e: React.DragEvent, columnId: string) => void;
  columnId: string;
  isDraggedColumn?: boolean;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  title,
  cards,
  onDragOver,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  columnId,
  isDraggedColumn = false
}) => {
  // Calculate column metrics
  const totalValue = cards.reduce((sum, card) => sum + (card.dealValue || 0), 0);
  const averageValue = cards.length > 0 ? totalValue / cards.length : 0;
  const averageProbability = cards.length > 0 
    ? cards.reduce((sum, card) => sum + (card.probability || 0), 0) / cards.length 
    : 0;
  
  // Get color based on total value
  const getValueColor = (value: number) => {
    if (value >= 100000) return 'text-green-600 dark:text-green-400';
    if (value >= 50000) return 'text-blue-600 dark:text-blue-400';
    if (value >= 20000) return 'text-orange-600 dark:text-orange-400';
    return 'text-muted-foreground';
  };

  const valueColorClass = getValueColor(totalValue);

  return (
    <Card 
      className={cn(
        "mb-4 transition-all duration-200 cursor-move",
        isDraggedColumn && "opacity-50 scale-95"
      )}
      draggable
      onDragStart={(e) => onColumnDragStart(e, columnId)}
      onDragOver={onColumnDragOver}
      onDrop={(e) => onColumnDrop(e, columnId)}
    >
      <CardHeader 
        className="pb-3"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, columnId)}
      >
        <CardTitle className="text-base font-medium text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{title}</span>
            <Badge variant="secondary" className="text-xs">
              <Users size={10} className="mr-1" />
              {cards.length}
            </Badge>
          </div>
        </CardTitle>
        
        {/* Metrics Row */}
        {cards.length > 0 && (
          <div className="space-y-2 pt-2">
            {/* Total Value */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <DollarSign size={12} className={valueColorClass} />
                <span className="text-muted-foreground">Total:</span>
              </div>
              <span className={cn("font-medium", valueColorClass)}>
                {formatCurrency(totalValue)}
              </span>
            </div>
            
            {/* Average Value and Probability */}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex flex-col">
                <span>Média:</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(averageValue)}
                </span>
              </div>
              <div className="flex flex-col">
                <span>Prob. Média:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    {averageProbability.toFixed(0)}%
                  </span>
                  <TrendingUp 
                    size={10} 
                    className={cn(
                      averageProbability >= 80 ? "text-green-500" :
                      averageProbability >= 60 ? "text-blue-500" :
                      averageProbability >= 40 ? "text-orange-500" :
                      "text-red-500"
                    )} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};