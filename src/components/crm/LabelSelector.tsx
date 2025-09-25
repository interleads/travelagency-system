import React, { useState } from 'react';
import { Label as LabelType } from './LabelBadge';
import { LabelBadge } from './LabelBadge';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabelSelectorProps {
  selectedLabels: LabelType[];
  onLabelsChange: (labels: LabelType[]) => void;
  availableLabels: LabelType[];
}

export const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels,
  onLabelsChange,
  availableLabels
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLabelToggle = (label: LabelType) => {
    const isSelected = selectedLabels.some(l => l.id === label.id);
    if (isSelected) {
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Etiquetas</Label>
      <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
        {selectedLabels.map(label => (
          <LabelBadge key={label.id} label={label} />
        ))}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs"
            >
              <Tag size={12} className="mr-1" />
              Adicionar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Selecione as etiquetas
              </div>
              <div className="space-y-1">
                {availableLabels.map(label => {
                  const isSelected = selectedLabels.some(l => l.id === label.id);
                  return (
                    <div 
                      key={label.id}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-muted/50",
                        isSelected && "bg-muted"
                      )}
                      onClick={() => handleLabelToggle(label)}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                      )}>
                        {isSelected && <Check size={8} className="text-primary-foreground m-0.5" />}
                      </div>
                      <LabelBadge label={label} className="flex-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};