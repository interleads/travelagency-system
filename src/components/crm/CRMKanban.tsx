import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/components/ui/use-toast';
import { usePhoneInput } from '@/lib/phoneMask';
import { Label as LabelType } from './LabelBadge';
import { ChecklistItem } from './ChecklistComponent';
import { Priority } from './PriorityBadge';
import { LeadSource } from './LeadSourceBadge';
import { CompactCard } from './CompactCard';
import { CardDetailsModal } from './CardDetailsModal';
import { ColumnHeader } from './ColumnHeader';
import { CardQuickActions } from './CardQuickActions';

// Kanban Column interface
interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

// Kanban Card interface
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

// Available labels
const availableLabels: LabelType[] = [
  { id: '1', name: 'Urgente', color: 'red' },
  { id: '2', name: 'Alta Prioridade', color: 'orange' },
  { id: '3', name: 'VIP', color: 'purple' },
  { id: '4', name: 'Promoção', color: 'blue' },
  { id: '5', name: 'Familia', color: 'green' },
  { id: '6', name: 'Corporativo', color: 'teal' },
  { id: '7', name: 'Lua de Mel', color: 'pink' },
  { id: '8', name: 'Grupo', color: 'yellow' }
];

// Initial columns with sample data
const initialColumns: KanbanColumn[] = [
  {
    id: 'prospect',
    title: 'Prospecção',
    cards: [
      {
        id: '1',
        title: 'Pacote Paris',
        description: 'Cliente interessado em pacote para Paris em Julho/2025',
        client: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 98765-4321',
        labels: [availableLabels[0], availableLabels[4]],
        dueDate: new Date(2025, 0, 15),
        checklist: [
          { id: '1', text: 'Consultar disponibilidade de voos', completed: true, createdAt: new Date() },
          { id: '2', text: 'Verificar documentação necessária', completed: true, createdAt: new Date() },
          { id: '3', text: 'Preparar orçamento detalhado', completed: false, createdAt: new Date() }
        ],
        dealValue: 25000,
        leadSource: 'referral' as LeadSource,
        probability: 80,
        priority: 'high' as Priority,
        assignedTo: 'Ana Costa',
        createdAt: new Date(2024, 11, 10),
        updatedAt: new Date(2024, 11, 20)
      }
    ]
  },
  {
    id: 'negotiation',
    title: 'Negociação',
    cards: [
      {
        id: '3',
        title: 'Pacote Orlando',
        description: 'Cliente negociando pacote para Orlando em Dezembro/2025',
        client: 'Pedro Santos',
        email: 'pedro.santos@email.com',
        phone: '(11) 95678-1234',
        labels: [availableLabels[2], availableLabels[4]],
        dueDate: new Date(2025, 0, 10),
        checklist: [
          { id: '6', text: 'Confirmar datas com o cliente', completed: true, createdAt: new Date() },
          { id: '7', text: 'Negociar desconto especial', completed: true, createdAt: new Date() },
          { id: '8', text: 'Finalizar contrato', completed: false, createdAt: new Date() }
        ],
        dealValue: 45000,
        leadSource: 'phone' as LeadSource,
        probability: 90,
        priority: 'urgent' as Priority,
        assignedTo: 'Carlos Mendes',
        createdAt: new Date(2024, 10, 25),
        updatedAt: new Date(2024, 11, 22)
      }
    ]
  }
];

interface CRMKanbanProps {
  registerAddColumn?: (fn: (title: string) => void) => void;
}

const CRMKanban = ({ registerAddColumn }: CRMKanbanProps) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [detailsCard, setDetailsCard] = useState<KanbanCard | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newCard, setNewCard] = useState<Partial<KanbanCard>>({
    title: '',
    client: '',
    description: ''
  });
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const newCardPhoneInput = usePhoneInput('');

  // Calculate available height
  useEffect(() => {
    const calculateHeight = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const availableSpace = window.innerHeight - rect.top - 20;
        setAvailableHeight(Math.max(400, availableSpace));
      }
    };
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Add new card
  const addCard = () => {
    if (!targetColumnId || !newCard.title || !newCard.client) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Título e nome do cliente são obrigatórios"
      });
      return;
    }
    
    const newCardComplete: KanbanCard = {
      id: `card-${Date.now()}`,
      title: newCard.title || '',
      description: newCard.description || '',
      client: newCard.client || '',
      email: '',
      phone: '',
      labels: [],
      checklist: [],
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setColumns(columns.map(col => 
      col.id === targetColumnId
        ? { ...col, cards: [...col.cards, newCardComplete] }
        : col
    ));
    
    setNewCard({ title: '', client: '', description: '' });
    setTargetColumnId(null);
    setIsAddClientDialogOpen(false);
    
    toast({
      title: "Cliente adicionado",
      description: `Cliente "${newCard.client}" foi adicionado`
    });
  };

  // Delete card
  const deleteCard = (columnId: string, cardId: string) => {
    setColumns(columns.map(col => 
      col.id === columnId
        ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
        : col
    ));
    
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso"
    });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, cardId: string, sourceColumnId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
    const card = sourceColumn.cards.find(c => c.id === cardId);
    if (!card) return;
    
    const updatedColumns = columns.map(col => 
      col.id === sourceColumnId
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        : col
    );
    
    const finalColumns = updatedColumns.map(col => 
      col.id === targetColumnId
        ? { ...col, cards: [...col.cards, card] }
        : col
    );
    
    setColumns(finalColumns);
  };

  // Card interaction handlers
  const handleCardClick = (card: KanbanCard) => {
    setDetailsCard(card);
    setIsDetailsModalOpen(true);
  };

  const handleQuickActions = (card: KanbanCard, event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const updateCard = (updatedCard: KanbanCard) => {
    setColumns(columns.map(col => ({
      ...col,
      cards: col.cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    })));
    
    toast({
      title: "Cliente atualizado",
      description: `As informações de "${updatedCard.client}" foram atualizadas`
    });
  };

  return (
    <>
      <div 
        ref={boardRef}
        className="h-full overflow-x-auto overflow-y-hidden"
        style={{ height: availableHeight > 0 ? `${availableHeight}px` : '100%' }}
      >
        <div className="flex space-x-4 p-4 min-w-max h-full">
          {columns.map(column => (
            <div 
              key={column.id}
              className="flex-shrink-0 w-80"
            >
              <div className="h-full flex flex-col" style={{ height: availableHeight > 0 ? `${availableHeight - 32}px` : '100%' }}>
                
                <ColumnHeader
                  title={column.title}
                  cards={column.cards}
                  columnId={column.id}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onColumnDragStart={() => {}}
                  onColumnDragOver={() => {}}
                  onColumnDrop={() => {}}
                />

                <div className="mb-4">
                  <Dialog 
                    open={isAddClientDialogOpen} 
                    onOpenChange={setIsAddClientDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setTargetColumnId(column.id)}
                      >
                        <UserPlus size={16} className="mr-2" />
                        Adicionar Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Cliente</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input 
                            id="title"
                            value={newCard.title || ''}
                            onChange={(e) => setNewCard({...newCard, title: e.target.value})}
                            placeholder="Ex: Pacote Cancún"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client">Nome do Cliente</Label>
                          <Input 
                            id="client"
                            value={newCard.client || ''}
                            onChange={(e) => setNewCard({...newCard, client: e.target.value})}
                            placeholder="Ex: João Silva"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea 
                            id="description"
                            value={newCard.description || ''}
                            onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                            placeholder="Detalhes sobre o cliente..."
                            rows={2}
                          />
                        </div>
                        <Button onClick={addCard} className="w-full">Adicionar Cliente</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div 
                  className="flex-1 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <ScrollArea className="h-full">
                    <div className="p-2">
                      {column.cards.map(card => (
                        <CompactCard
                          key={card.id}
                          card={card}
                          columnId={column.id}
                          onCardClick={handleCardClick}
                          onQuickActions={handleQuickActions}
                          onDragStart={handleDragStart}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CardDetailsModal
        card={detailsCard}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsCard(null);
        }}
        onSave={updateCard}
        availableLabels={availableLabels}
      />
    </>
  );
};

export default CRMKanban;