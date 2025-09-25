import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Save, X, User, MapPin, Phone, Mail, DollarSign, TrendingUp } from "lucide-react";
import { LabelBadge, Label as LabelType } from './LabelBadge';
import { LabelSelector } from './LabelSelector';
import { DueDateBadge } from './DueDateBadge';
import { ChecklistComponent, ChecklistItem } from './ChecklistComponent';
import { PriorityBadge, Priority } from './PriorityBadge';
import { DealValueBadge } from './DealValueBadge';
import { LeadSourceBadge, LeadSource } from './LeadSourceBadge';
import { usePhoneInput } from '@/lib/phoneMask';
import { formatCurrency, parseCurrency, useCurrencyInput } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

interface CardDetailsModalProps {
  card: KanbanCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: KanbanCard) => void;
  availableLabels: LabelType[];
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const leadSourceOptions: { value: LeadSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Indicação' },
  { value: 'social', label: 'Redes Sociais' },
  { value: 'email', label: 'Email Marketing' },
  { value: 'phone', label: 'Telefone' },
  { value: 'event', label: 'Evento' },
  { value: 'advertisement', label: 'Anúncio' },
  { value: 'search', label: 'Busca Online' },
  { value: 'other', label: 'Outro' }
];

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
  availableLabels
}) => {
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const phoneInput = usePhoneInput('');
  const dealValueInput = useCurrencyInput(0);

  // Initialize form when card changes
  useEffect(() => {
    if (card) {
      setEditingCard({ ...card });
      phoneInput.setDisplayValue(card.phone);
      dealValueInput.setValue(card.dealValue ?? 0);
    }
  }, [card]);

  if (!card || !editingCard) return null;

  const handleSave = () => {
    const updatedCard: KanbanCard = {
      ...editingCard,
      phone: phoneInput.rawValue,
      dealValue: dealValueInput.numericValue || undefined,
      updatedAt: new Date()
    };
    onSave(updatedCard);
    onClose();
  };

  const handleFieldChange = (field: keyof KanbanCard, value: any) => {
    setEditingCard(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User size={20} />
            Detalhes do Cliente
          </DialogTitle>
          <DialogDescription>
            Visualize e edite todas as informações do cliente e negócio.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Negócio</Label>
                  <Input
                    id="title"
                    value={editingCard.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Ex: Pacote Paris"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client">Nome do Cliente</Label>
                  <Input
                    id="client"
                    value={editingCard.client}
                    onChange={(e) => handleFieldChange('client', e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={editingCard.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={phoneInput.displayValue}
                      onChange={phoneInput.handleChange}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingCard.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Detalhes sobre o negócio..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Deal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações do Negócio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealValue">Valor do Negócio</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dealValue"
                      className="pl-10"
                      value={dealValueInput.displayValue}
                      onChange={dealValueInput.handleChange}
                      onBlur={dealValueInput.handleBlur}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidade (%)</Label>
                  <div className="relative">
                    <TrendingUp className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      className="pl-10"
                      value={editingCard.probability ?? ''}
                      onChange={(e) => handleFieldChange('probability', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Responsável</Label>
                  <Input
                    id="assignedTo"
                    value={editingCard.assignedTo ?? ''}
                    onChange={(e) => handleFieldChange('assignedTo', e.target.value || undefined)}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select 
                    value={editingCard.priority} 
                    onValueChange={(value: Priority) => handleFieldChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={option.value} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Origem do Lead</Label>
                  <Select 
                    value={editingCard.leadSource ?? ''} 
                    onValueChange={(value: LeadSource) => handleFieldChange('leadSource', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <LeadSourceBadge source={option.value} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Labels and Due Date */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Etiquetas e Prazo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Etiquetas</Label>
                  <LabelSelector
                    availableLabels={availableLabels}
                    selectedLabels={editingCard.labels}
                    onLabelsChange={(labels) => handleFieldChange('labels', labels)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingCard.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingCard.dueDate ? (
                          format(editingCard.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingCard.dueDate}
                        onSelect={(date) => handleFieldChange('dueDate', date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Separator />

            {/* Checklist */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lista de Tarefas</h3>
              <ChecklistComponent
                items={editingCard.checklist}
                onItemsChange={(checklist) => handleFieldChange('checklist', checklist)}
                isExpanded={true}
              />
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        <div className="border-t p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};