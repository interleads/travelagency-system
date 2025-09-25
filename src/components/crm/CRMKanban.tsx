import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, UserPlus, MoreVertical, CalendarIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/components/ui/use-toast';
import { usePhoneInput, unformatPhoneNumber } from '@/lib/phoneMask';
import { LabelBadge, Label as LabelType } from './LabelBadge';
import { LabelSelector } from './LabelSelector';
import { DueDateBadge } from './DueDateBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

// Initial columns
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
        labels: [availableLabels[0], availableLabels[4]], // Urgente, Familia
        dueDate: new Date(2025, 0, 15) // 15/01/2025
      },
      {
        id: '2',
        title: 'Pacote Cancún',
        description: 'Cliente interessado em pacote para Cancún em Maio/2025',
        client: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        phone: '(11) 91234-5678',
        labels: [availableLabels[3]], // Promoção
        dueDate: new Date(2025, 0, 20) // 20/01/2025
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
        labels: [availableLabels[2], availableLabels[4]], // VIP, Familia
        dueDate: new Date(2025, 0, 10) // 10/01/2025
      }
    ]
  },
  {
    id: 'closed',
    title: 'Fechado',
    cards: [
      {
        id: '4',
        title: 'Pacote Buenos Aires',
        description: 'Cliente fechou pacote para Buenos Aires em Setembro/2025',
        client: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '(11) 94321-8765',
        labels: [availableLabels[6]], // Lua de Mel
        dueDate: new Date(2024, 11, 25) // 25/12/2024 (overdue)
      }
    ]
  },
  {
    id: 'delivered',
    title: 'Entregue',
    cards: [
      {
        id: '5',
        title: 'Pacote Rio de Janeiro',
        description: 'Cliente retornou de viagem ao Rio de Janeiro',
        client: 'Carlos Mendes',
        email: 'carlos.mendes@email.com',
        phone: '(11) 93456-7890',
        labels: [availableLabels[5]], // Corporativo
        dueDate: new Date(2024, 11, 20) // 20/12/2024 (completed)
      }
    ]
  }
];

interface CRMKanbanProps {
  registerAddColumn?: (fn: (title: string) => void) => void;
}

const CRMKanban = ({ registerAddColumn }: CRMKanbanProps) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [newCard, setNewCard] = useState<Partial<KanbanCard>>({
    title: '',
    description: '',
    client: '',
    email: '',
    phone: '',
    labels: [],
    dueDate: undefined
  });
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Phone input hooks
  const newCardPhoneInput = usePhoneInput('');
  const editCardPhoneInput = usePhoneInput('');

  // Register add column function with parent
  useEffect(() => {
    if (registerAddColumn) {
      registerAddColumn((title: string) => {
        if (title.trim() === '') {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "O título da coluna não pode estar vazio"
          });
          return;
        }
        
        const newColumn: KanbanColumn = {
          id: `column-${Date.now()}`,
          title,
          cards: []
        };
        
        setColumns(prev => [...prev, newColumn]);
        
        toast({
          title: "Coluna adicionada",
          description: `Nova coluna "${title}" foi adicionada`
        });
      });
    }
  }, [registerAddColumn, toast]);

  // Calculate available height for the board
  useEffect(() => {
    const calculateHeight = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const availableSpace = window.innerHeight - rect.top - 20; // 20px margin
        setAvailableHeight(Math.max(400, availableSpace));
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Add new column
  const addColumn = () => {
    if (newColumnTitle.trim() === '') {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título da coluna não pode estar vazio"
      });
      return;
    }
    
    const newColumn: KanbanColumn = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      cards: []
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    
    toast({
      title: "Coluna adicionada",
      description: `Nova coluna "${newColumnTitle}" foi adicionada`
    });
  };

  // Add new card
  const addCard = () => {
    if (!targetColumnId) return;
    
    if (!newCard.title || !newCard.client) {
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
      email: newCard.email || '',
      phone: newCardPhoneInput.rawValue,
      labels: newCard.labels || [],
      dueDate: newCard.dueDate
    };
    
    setColumns(columns.map(col => 
      col.id === targetColumnId
        ? { ...col, cards: [...col.cards, newCardComplete] }
        : col
    ));
    
    setNewCard({
      title: '',
      description: '',
      client: '',
      email: '',
      phone: '',
      labels: [],
      dueDate: undefined
    });
    newCardPhoneInput.setDisplayValue('');
    setTargetColumnId(null);
    setIsAddClientDialogOpen(false);
    
    toast({
      title: "Cliente adicionado",
      description: `Cliente "${newCard.client}" foi adicionado`
    });
  };

  // Update card
  const updateCard = () => {
    if (!editingCard) return;
    
    const updatedCard = {
      ...editingCard,
      phone: editCardPhoneInput.rawValue
    };
    
    setColumns(columns.map(col => ({
      ...col,
      cards: col.cards.map(card => 
        card.id === editingCard.id ? updatedCard : card
      )
    })));
    
    setEditingCard(null);
    editCardPhoneInput.setDisplayValue('');
    
    toast({
      title: "Cliente atualizado",
      description: `As informações de "${editingCard.client}" foram atualizadas`
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, cardId: string, sourceColumnId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop (cards)
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const cardId = e.dataTransfer.getData('cardId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    // Find the source column and card
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    if (!sourceColumn) return;
    
    const card = sourceColumn.cards.find(c => c.id === cardId);
    if (!card) return;
    
    // Remove card from source column
    const updatedColumns = columns.map(col => 
      col.id === sourceColumnId
        ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
        : col
    );
    
    // Add card to target column
    const finalColumns = updatedColumns.map(col => 
      col.id === targetColumnId
        ? { ...col, cards: [...col.cards, card] }
        : col
    );
    
    setColumns(finalColumns);
    
    toast({
      title: "Cliente movido",
      description: `Cliente movido para "${columns.find(col => col.id === targetColumnId)?.title}"`
    });
  };

  // Column drag handlers
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.setData('columnId', columnId);
    setDraggedColumnId(columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sourceColumnId = e.dataTransfer.getData('columnId');
    if (sourceColumnId === targetColumnId) return;
    
    const sourceIndex = columns.findIndex(col => col.id === sourceColumnId);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;
    
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(sourceIndex, 1);
    newColumns.splice(targetIndex, 0, movedColumn);
    
    setColumns(newColumns);
    setDraggedColumnId(null);
    
    toast({
      title: "Coluna reordenada",
      description: `Coluna "${movedColumn.title}" foi reordenada`
    });
  };

  return (
    <div 
      ref={boardRef}
      className="h-full overflow-x-auto overflow-y-hidden"
      style={{ height: availableHeight > 0 ? `${availableHeight}px` : '100%' }}
    >
      <div className="flex space-x-4 p-4 min-w-max h-full">
            {columns.map(column => (
              <div 
                key={column.id}
                className={`flex-shrink-0 w-80 ${draggedColumnId === column.id ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, column.id)}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, column.id)}
              >
                <Card className="h-full flex flex-col" style={{ height: availableHeight > 0 ? `${availableHeight - 32}px` : '100%' }}>
                  {/* Fixed header */}
                  <CardHeader 
                    className="bg-muted/50 flex-shrink-0 cursor-move border-b"
                    onDragOver={(e) => e.stopPropagation()}
                    onDrop={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                      <Dialog 
                        open={isAddClientDialogOpen} 
                        onOpenChange={(open) => {
                          setIsAddClientDialogOpen(open);
                          if (!open) {
                            // Clear form when modal closes
                            setNewCard({
                              title: '',
                              description: '',
                              client: '',
                              email: '',
                              phone: '',
                              labels: [],
                              dueDate: undefined
                            });
                            newCardPhoneInput.setDisplayValue('');
                            setTargetColumnId(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetColumnId(column.id);
                            }}
                          >
                            <UserPlus size={14} />
                          </Button>
                        </DialogTrigger>
                      <DialogContent>
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
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email"
                              type="email"
                              value={newCard.email || ''}
                              onChange={(e) => setNewCard({...newCard, email: e.target.value})}
                              placeholder="Ex: joao@email.com"
                            />
                          </div>
                           <div>
                             <Label htmlFor="phone">Telefone</Label>
                             <Input 
                               id="phone"
                               type="tel"
                               value={newCardPhoneInput.displayValue}
                               onChange={newCardPhoneInput.handleChange}
                               placeholder="(11) 99999-9999"
                               maxLength={15}
                             />
                           </div>
                          <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea 
                              id="description"
                              value={newCard.description || ''}
                              onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                              placeholder="Detalhes sobre o cliente e sua solicitação..."
                              rows={3}
                            />
                          </div>

                          <LabelSelector 
                            selectedLabels={newCard.labels || []}
                            onLabelsChange={(labels) => setNewCard({...newCard, labels})}
                            availableLabels={availableLabels}
                          />

                          <div>
                            <Label>Data de Vencimento</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !newCard.dueDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {newCard.dueDate ? format(newCard.dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={newCard.dueDate}
                                  onSelect={(date) => setNewCard({...newCard, dueDate: date})}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <Button onClick={addCard} className="w-full">Adicionar Cliente</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {column.cards.length} {column.cards.length === 1 ? 'cliente' : 'clientes'}
                    </div>
                  </CardHeader>
                  
                  {/* Scrollable cards area */}
                  <div 
                    className="flex-1 overflow-hidden"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <ScrollArea className="h-full">
                      <CardContent className="space-y-3 py-4">
                        {column.cards.map(card => (
                          <Card 
                            key={card.id}
                            className="bg-card shadow-sm cursor-move hover:shadow-md transition-shadow"
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, card.id, column.id);
                            }}
                          >
                            <CardContent className="p-3 space-y-2">
                              {/* Card Header with title and actions */}
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm leading-tight">{card.title}</h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical size={12} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => {
                                            e.preventDefault();
                                            setEditingCard(card);
                                            editCardPhoneInput.setDisplayValue(card.phone || '');
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Edit size={12} className="mr-2" />
                                          Editar Cliente
                                        </DropdownMenuItem>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Editar Cliente</DialogTitle>
                                        </DialogHeader>
                                        {editingCard && (
                                          <div className="space-y-4 pt-4">
                                            <div>
                                              <Label htmlFor="edit-title">Título</Label>
                                              <Input 
                                                id="edit-title"
                                                value={editingCard.title}
                                                onChange={(e) => setEditingCard({...editingCard, title: e.target.value})}
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-client">Nome do Cliente</Label>
                                              <Input 
                                                id="edit-client"
                                                value={editingCard.client}
                                                onChange={(e) => setEditingCard({...editingCard, client: e.target.value})}
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-email">Email</Label>
                                              <Input 
                                                id="edit-email"
                                                type="email"
                                                value={editingCard.email}
                                                onChange={(e) => setEditingCard({...editingCard, email: e.target.value})}
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-phone">Telefone</Label>
                                              <Input 
                                                id="edit-phone"
                                                type="tel"
                                                value={editCardPhoneInput.displayValue}
                                                onChange={editCardPhoneInput.handleChange}
                                                placeholder="(11) 99999-9999"
                                                maxLength={15}
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="edit-description">Descrição</Label>
                                              <Textarea 
                                                id="edit-description"
                                                value={editingCard.description}
                                                onChange={(e) => setEditingCard({...editingCard, description: e.target.value})}
                                                rows={3}
                                              />
                                            </div>

                                            <LabelSelector 
                                              selectedLabels={editingCard.labels || []}
                                              onLabelsChange={(labels) => setEditingCard({...editingCard, labels})}
                                              availableLabels={availableLabels}
                                            />

                                            <div>
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
                                                    {editingCard.dueDate ? format(editingCard.dueDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                                                  </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                  <Calendar
                                                    mode="single"
                                                    selected={editingCard.dueDate}
                                                    onSelect={(date) => setEditingCard({...editingCard, dueDate: date})}
                                                    initialFocus
                                                    className="pointer-events-auto"
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                            </div>

                                            <Button onClick={updateCard} className="w-full">Salvar Alterações</Button>
                                          </div>
                                        )}
                                      </DialogContent>
                                    </Dialog>
                                    
                                    <DropdownMenuItem 
                                      onSelect={() => deleteCard(column.id, card.id)}
                                      className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                      <Trash2 size={12} className="mr-2" />
                                      Excluir Cliente
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Labels */}
                              {card.labels && card.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {card.labels.map(label => (
                                    <LabelBadge key={label.id} label={label} />
                                  ))}
                                </div>
                              )}

                              {/* Due date */}
                              {card.dueDate && (
                                <DueDateBadge dueDate={card.dueDate} />
                              )}

                              {/* Client info */}
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Cliente:</span> {card.client}
                                </p>
                                {card.email && (
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Email:</span> {card.email}
                                  </p>
                                )}
                                {card.phone && (
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Telefone:</span> {card.phone}
                                  </p>
                                )}
                              </div>

                              {/* Description */}
                              {card.description && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {card.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                         ))}
                      </CardContent>
                    </ScrollArea>
                  </div>
                </Card>
              </div>
            ))}
        </div>
    </div>
  );
};

export default CRMKanban;