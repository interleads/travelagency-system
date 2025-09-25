import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Clock } from "lucide-react";
import { LabelBadge, Label as LabelType } from './LabelBadge';
import { DealValueBadge } from './DealValueBadge';
import { PriorityBadge, Priority } from './PriorityBadge';
import { ChecklistItem } from './ChecklistComponent';
import { LeadSource } from './LeadSourceBadge';
import { cn } from "@/lib/utils";
import { isAfter, isBefore, addDays } from 'date-fns';

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

interface CompactCardProps {
  card: KanbanCard;
  onCardClick: (card: KanbanCard) => void;
  onQuickActions: (card: KanbanCard, event: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  columnId: string;
}

export const CompactCard: React.FC<CompactCardProps> = ({
  card,
  onCardClick,
  onQuickActions,
  onDragStart,
  columnId
}) => {
  // Calculate checklist completion
  const completedTasks = card.checklist.filter(item => item.completed).length;
  const totalTasks = card.checklist.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Check if due date is approaching or overdue
  const isDueSoon = card.dueDate && isAfter(card.dueDate, new Date()) && 
                    isBefore(card.dueDate, addDays(new Date(), 3));
  const isOverdue = card.dueDate && isBefore(card.dueDate, new Date());

  // Show only first 2 labels with overflow indicator
  const visibleLabels = card.labels.slice(0, 2);
  const extraLabelsCount = Math.max(0, card.labels.length - 2);

  return (
    <Card 
      className="mb-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-border/50 hover:border-border group"
      draggable
      onDragStart={(e) => onDragStart(e, card.id, columnId)}
      onClick={() => onCardClick(card)}
    >
      <CardContent className="p-3">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate mb-1">
              {card.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {card.client}
            </p>
          </div>
          <button
            onClick={(e) => onQuickActions(card, e)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded ml-2 flex-shrink-0"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Labels row */}
        {card.labels.length > 0 && (
          <div className="flex items-center gap-1 mb-2 flex-wrap">
            {visibleLabels.map(label => (
              <LabelBadge key={label.id} label={label} className="text-xs" />
            ))}
            {extraLabelsCount > 0 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{extraLabelsCount}
              </Badge>
            )}
          </div>
        )}

        {/* Value and due date row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {card.dealValue && (
              <DealValueBadge value={card.dealValue} className="text-xs" />
            )}
            <PriorityBadge priority={card.priority} className="text-xs" showIcon={false} />
          </div>
          
          {card.dueDate && (isDueSoon || isOverdue) && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : "text-orange-600 dark:text-orange-400"
            )}>
              <Clock size={10} />
              <span className="text-xs">
                {isOverdue ? 'Vencido' : 'Urgente'}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar for checklist */}
        {totalTasks > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tarefas</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};