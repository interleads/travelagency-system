import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/components/ui/use-toast';
import { usePhoneInput } from '@/lib/phoneMask';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label as LabelType } from './LabelBadge';
import { ChecklistItem } from './ChecklistComponent';
import { Priority } from './PriorityBadge';
import { LeadSource } from './LeadSourceBadge';
import { CompactCard } from './CompactCard';
import { CardDetailsModal } from './CardDetailsModal';
import { ColumnHeader } from './ColumnHeader';
import { CardQuickActions } from './CardQuickActions';
import { useCRMSupabase, KanbanCard, KanbanColumn } from '@/hooks/useCRMSupabase';

// Types are now imported from the hook

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

interface CRMKanbanProps {
  registerAddColumn?: (fn: (title: string) => void) => void;
}

const CRMKanban = ({ registerAddColumn }: CRMKanbanProps) => {
  // Use the Supabase hook
  const {
    columns,
    isLoaded,
    addColumn,
    addCard: addCardToPersistence,
    updateCard: updateCardInPersistence,
    deleteCard: deleteCardFromPersistence,
    moveCard
  } = useCRMSupabase();

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
  const isMobile = useIsMobile();
  
  const newCardPhoneInput = usePhoneInput('');

  // Register add column function with parent
  useEffect(() => {
    if (registerAddColumn && isLoaded) {
      registerAddColumn((title: string) => {
        addColumn(title);
      });
    }
  }, [registerAddColumn, addColumn, isLoaded]);

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
    if (!targetColumnId) return;
    
    addCardToPersistence(targetColumnId, newCard);
    setNewCard({ title: '', client: '', description: '' });
    setTargetColumnId(null);
    setIsAddClientDialogOpen(false);
  };

  // Delete card
  const deleteCard = (columnId: string, cardId: string) => {
    deleteCardFromPersistence(columnId, cardId);
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
    
    if (sourceColumnId !== targetColumnId) {
      moveCard(cardId, sourceColumnId, targetColumnId);
    }
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
    updateCardInPersistence(updatedCard);
  };

  // Show loading state if data is not loaded yet
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando dados do CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={boardRef}
        className="h-full overflow-x-auto overflow-y-hidden"
        style={{ height: availableHeight > 0 ? `${availableHeight}px` : '100%' }}
      >
        <div className={`flex ${isMobile ? 'space-x-3 p-3' : 'space-x-4 p-4'} min-w-max h-full`}>
          {columns.map(column => (
            <div 
              key={column.id}
              className={`flex-shrink-0 ${isMobile ? 'w-72' : 'w-80'}`}
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
                    <DialogContent className={`${isMobile ? 'max-w-[95vw] mx-2' : 'max-w-md'}`}>
                      <DialogHeader>
                        <DialogTitle>Adicionar Cliente</DialogTitle>
                        <DialogDescription>
                          Preencha as informações básicas do novo cliente.
                        </DialogDescription>
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