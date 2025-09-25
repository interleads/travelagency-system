import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, ListTodo } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface ChecklistComponentProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  className?: string;
  isExpanded?: boolean;
}

export const ChecklistComponent: React.FC<ChecklistComponentProps> = ({
  items,
  onItemsChange,
  className,
  isExpanded = false
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [isOpen, setIsOpen] = useState(isExpanded);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const addItem = () => {
    if (newItemText.trim() === '') return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date()
    };

    onItemsChange([...items, newItem]);
    setNewItemText('');
  };

  const toggleItem = (itemId: string) => {
    onItemsChange(
      items.map(item =>
        item.id === itemId
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const deleteItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-2">
        <ListTodo size={14} />
        Checklist
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({completedCount}/{totalCount})
          </span>
        )}
      </Label>

      {totalCount > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {completedCount} de {totalCount} itens concluídos
          </div>
        </div>
      )}

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <Plus size={12} />
              {totalCount > 0 ? 'Gerenciar checklist' : 'Adicionar checklist'}
            </span>
            <span className="text-xs">
              {isOpen ? 'Ocultar' : 'Mostrar'}
            </span>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3 pt-2">
          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Adicionar item..."
              className="text-xs"
            />
            <Button 
              onClick={addItem}
              size="sm"
              variant="outline"
              disabled={newItemText.trim() === ''}
            >
              <Plus size={12} />
            </Button>
          </div>

          {/* Checklist items */}
          {items.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/20 group"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="flex-shrink-0"
                  />
                  <span
                    className={cn(
                      "flex-1 text-xs",
                      item.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteItem(item.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={10} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};