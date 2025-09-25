import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, ArrowRight, User, Calendar, Flag } from "lucide-react";
import { ChecklistItem } from './ChecklistComponent';
import { Label as LabelType } from './LabelBadge';
import { LeadSource } from './LeadSourceBadge';
import { Priority } from './PriorityBadge';

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

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface CardQuickActionsProps {
  card: KanbanCard;
  columns: KanbanColumn[];
  currentColumnId: string;
  onEdit: (card: KanbanCard) => void;
  onDelete: (columnId: string, cardId: string) => void;
  onMoveToColumn: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  onQuickPriorityChange: (cardId: string, priority: Priority) => void;
  trigger?: React.ReactNode;
}

const priorityOptions: { value: Priority; label: string; icon: React.ReactNode }[] = [
  { value: 'low', label: 'Baixa', icon: <Flag size={12} className="text-green-500" /> },
  { value: 'medium', label: 'Média', icon: <Flag size={12} className="text-yellow-500" /> },
  { value: 'high', label: 'Alta', icon: <Flag size={12} className="text-orange-500" /> },
  { value: 'urgent', label: 'Urgente', icon: <Flag size={12} className="text-red-500" /> }
];

export const CardQuickActions: React.FC<CardQuickActionsProps> = ({
  card,
  columns,
  currentColumnId,
  onEdit,
  onDelete,
  onMoveToColumn,
  onQuickPriorityChange,
  trigger
}) => {
  const otherColumns = columns.filter(col => col.id !== currentColumnId);

  const handleMoveToColumn = (targetColumnId: string) => {
    onMoveToColumn(card.id, currentColumnId, targetColumnId);
  };

  const handlePriorityChange = (priority: Priority) => {
    onQuickPriorityChange(card.id, priority);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical size={12} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEdit(card)}>
          <Edit size={14} className="mr-2" />
          Editar Detalhes
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Move to other columns */}
        {otherColumns.length > 0 && (
          <>
            {otherColumns.map((column) => (
              <DropdownMenuItem 
                key={column.id}
                onClick={() => handleMoveToColumn(column.id)}
              >
                <ArrowRight size={14} className="mr-2" />
                Mover para {column.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Quick priority change */}
        {priorityOptions.map((option) => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => handlePriorityChange(option.value)}
            disabled={card.priority === option.value}
          >
            {option.icon}
            <span className="ml-2">Prioridade: {option.label}</span>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDelete(currentColumnId, card.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 size={14} className="mr-2" />
          Excluir Cliente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};