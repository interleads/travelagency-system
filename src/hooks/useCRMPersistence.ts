import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Types
import { Label as LabelType } from '@/components/crm/LabelBadge';
import { ChecklistItem } from '@/components/crm/ChecklistComponent';
import { Priority } from '@/components/crm/PriorityBadge';
import { LeadSource } from '@/components/crm/LeadSourceBadge';

export interface KanbanCard {
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

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

// localStorage key
const CRM_STORAGE_KEY = 'crm-kanban-data';

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

// Default initial data
const getInitialColumns = (): KanbanColumn[] => [
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

// Utility functions for localStorage
const saveToStorage = (data: KanbanColumn[]) => {
  try {
    const serializedData = JSON.stringify(data, (key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    localStorage.setItem(CRM_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
};

const loadFromStorage = (): KanbanColumn[] | null => {
  try {
    const storedData = localStorage.getItem(CRM_STORAGE_KEY);
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    
    // Convert ISO strings back to Date objects
    const restoreData = (obj: any): any => {
      if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
        return new Date(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(restoreData);
      }
      if (obj && typeof obj === 'object') {
        const restored: any = {};
        for (const [key, value] of Object.entries(obj)) {
          restored[key] = restoreData(value);
        }
        return restored;
      }
      return obj;
    };
    
    return restoreData(parsedData);
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
    return null;
  }
};

export const useCRMPersistence = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Load data on mount
  useEffect(() => {
    const storedData = loadFromStorage();
    if (storedData && storedData.length > 0) {
      setColumns(storedData);
      toast({
        title: "Dados carregados",
        description: "Seus dados do CRM foram restaurados com sucesso"
      });
    } else {
      // Use default data if no stored data
      setColumns(getInitialColumns());
    }
    setIsLoaded(true);
  }, [toast]);

  // Save data whenever columns change (but not on initial load)
  useEffect(() => {
    if (isLoaded && columns.length > 0) {
      saveToStorage(columns);
    }
  }, [columns, isLoaded]);

  // Functions to manipulate data
  const updateColumns = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
  };

  const addColumn = (title: string) => {
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
  };

  const addCard = (columnId: string, cardData: Partial<KanbanCard>) => {
    if (!cardData.title || !cardData.client) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Título e nome do cliente são obrigatórios"
      });
      return;
    }
    
    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: cardData.title || '',
      description: cardData.description || '',
      client: cardData.client || '',
      email: cardData.email || '',
      phone: cardData.phone || '',
      labels: cardData.labels || [],
      dueDate: cardData.dueDate,
      checklist: cardData.checklist || [],
      dealValue: cardData.dealValue,
      leadSource: cardData.leadSource,
      probability: cardData.probability,
      priority: cardData.priority || 'medium',
      assignedTo: cardData.assignedTo,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setColumns(prev => prev.map(col => 
      col.id === columnId
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ));
    
    toast({
      title: "Cliente adicionado",
      description: `Cliente "${newCard.client}" foi adicionado`
    });
  };

  const updateCard = (updatedCard: KanbanCard) => {
    const updatedCardWithTimestamp = {
      ...updatedCard,
      updatedAt: new Date()
    };
    
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card => 
        card.id === updatedCard.id ? updatedCardWithTimestamp : card
      )
    })));
    
    toast({
      title: "Cliente atualizado",
      description: `As informações de "${updatedCard.client}" foram atualizadas`
    });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const cardToDelete = columns
      .find(col => col.id === columnId)
      ?.cards.find(card => card.id === cardId);
    
    setColumns(prev => prev.map(col => 
      col.id === columnId
        ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
        : col
    ));
    
    toast({
      title: "Cliente removido",
      description: `Cliente "${cardToDelete?.client || 'desconhecido'}" foi removido`
    });
  };

  const moveCard = (cardId: string, sourceColumnId: string, targetColumnId: string) => {
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

  const clearAllData = () => {
    localStorage.removeItem(CRM_STORAGE_KEY);
    setColumns(getInitialColumns());
    toast({
      title: "Dados limpos",
      description: "Todos os dados do CRM foram removidos e os dados iniciais foram restaurados"
    });
  };

  return {
    columns,
    isLoaded,
    updateColumns,
    addColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    clearAllData
  };
};