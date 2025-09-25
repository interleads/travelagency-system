import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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
  dealValue?: number;
  dueDate?: Date;
  priority: Priority;
  labels: LabelType[];
  checklist: ChecklistItem[];
  leadSource?: LeadSource;
  probability?: number;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
  cards: KanbanCard[];
}

export const useCRMSupabase = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('crm_columns' as any)
        .select('*')
        .order('position', { ascending: true });

      if (columnsError) throw columnsError;

      // Load cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('crm_cards' as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (cardsError) throw cardsError;

      // Group cards by column
      const columnsWithCards: KanbanColumn[] = (columnsData || []).map((col: any) => ({
        id: col.id,
        title: col.title,
        position: col.position,
        cards: (cardsData || [])
          .filter((card: any) => card.column_id === col.id)
          .map((card: any) => ({
            id: card.id,
            title: card.title || '',
            description: card.description || '',
            client: card.client || '',
            email: card.email || '',
            phone: card.phone || '',
            dealValue: card.deal_value,
            dueDate: card.due_date ? new Date(card.due_date) : undefined,
            priority: card.priority as Priority,
            labels: (card.labels as LabelType[]) || [],
            checklist: (card.checklist as ChecklistItem[]) || [],
            leadSource: card.lead_source as LeadSource,
            probability: card.probability,
            assignedTo: card.assigned_to || '',
            createdAt: new Date(card.created_at),
            updatedAt: new Date(card.updated_at),
          }))
      }));

      setColumns(columnsWithCards);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading CRM data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do CRM.",
        variant: "destructive",
      });
      setIsLoaded(true);
    }
  };

  const addColumn = useCallback(async (title: string) => {
    try {
      const maxPosition = Math.max(...columns.map(c => c.position), -1);
      
      const { data, error } = await supabase
        .from('crm_columns' as any)
        .insert({
          title,
          position: maxPosition + 1
        })
        .select()
        .single();

      if (error) throw error;

      const newColumn: KanbanColumn = {
        id: (data as any).id,
        title: (data as any).title,
        position: (data as any).position,
        cards: []
      };

      setColumns(prev => [...prev, newColumn]);
      toast({
        title: "Coluna adicionada",
        description: `A coluna "${title}" foi criada com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding column:', error);
      toast({
        title: "Erro ao adicionar coluna",
        description: "Não foi possível criar a nova coluna.",
        variant: "destructive",
      });
    }
  }, [columns, toast]);

  const addCard = useCallback(async (columnId: string, cardData: Partial<KanbanCard>) => {
    if (!cardData.title || !cardData.client) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e nome do cliente são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crm_cards' as any)
        .insert({
          column_id: columnId,
          title: cardData.title,
          description: cardData.description || '',
          client: cardData.client,
          email: cardData.email || '',
          phone: cardData.phone || '',
          deal_value: cardData.dealValue,
          due_date: cardData.dueDate ? cardData.dueDate.toISOString().split('T')[0] : null,
          priority: cardData.priority || 'medium',
          labels: cardData.labels || [],
          checklist: cardData.checklist || [],
          lead_source: cardData.leadSource,
          probability: cardData.probability,
          assigned_to: cardData.assignedTo || '',
        })
        .select()
        .single();

      if (error) throw error;

      const newCard: KanbanCard = {
        id: (data as any).id,
        title: (data as any).title || '',
        description: (data as any).description || '',
        client: (data as any).client || '',
        email: (data as any).email || '',
        phone: (data as any).phone || '',
        dealValue: (data as any).deal_value,
        dueDate: (data as any).due_date ? new Date((data as any).due_date) : undefined,
        priority: (data as any).priority as Priority,
        labels: ((data as any).labels as LabelType[]) || [],
        checklist: ((data as any).checklist as ChecklistItem[]) || [],
        leadSource: (data as any).lead_source as LeadSource,
        probability: (data as any).probability,
        assignedTo: (data as any).assigned_to || '',
        createdAt: new Date((data as any).created_at),
        updatedAt: new Date((data as any).updated_at),
      };

      setColumns(prev => prev.map(column =>
        column.id === columnId
          ? { ...column, cards: [...column.cards, newCard] }
          : column
      ));

      toast({
        title: "Cliente adicionado",
        description: `${cardData.client} foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível adicionar o cliente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateCard = useCallback(async (updatedCard: KanbanCard) => {
    try {
      const { error } = await supabase
        .from('crm_cards' as any)
        .update({
          title: updatedCard.title,
          description: updatedCard.description,
          client: updatedCard.client,
          email: updatedCard.email,
          phone: updatedCard.phone,
          deal_value: updatedCard.dealValue,
          due_date: updatedCard.dueDate ? updatedCard.dueDate.toISOString().split('T')[0] : null,
          priority: updatedCard.priority,
          labels: updatedCard.labels,
          checklist: updatedCard.checklist,
          lead_source: updatedCard.leadSource,
          probability: updatedCard.probability,
          assigned_to: updatedCard.assignedTo,
        })
        .eq('id', updatedCard.id);

      if (error) throw error;

      setColumns(prev => prev.map(column => ({
        ...column,
        cards: column.cards.map(card =>
          card.id === updatedCard.id ? { ...updatedCard, updatedAt: new Date() } : card
        )
      })));

      toast({
        title: "Cliente atualizado",
        description: "As informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteCard = useCallback(async (columnId: string, cardId: string) => {
    try {
      const { error } = await supabase
        .from('crm_cards' as any)
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      setColumns(prev => prev.map(column =>
        column.id === columnId
          ? { ...column, cards: column.cards.filter(card => card.id !== cardId) }
          : column
      ));

      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro ao remover cliente",
        description: "Não foi possível remover o cliente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const moveCard = useCallback(async (cardId: string, sourceColumnId: string, targetColumnId: string) => {
    try {
      const { error } = await supabase
        .from('crm_cards' as any)
        .update({ column_id: targetColumnId })
        .eq('id', cardId);

      if (error) throw error;

      setColumns(prev => {
        const newColumns = [...prev];
        let movedCard: KanbanCard | null = null;

        // Remove card from source column
        const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
        if (sourceColumn) {
          const cardIndex = sourceColumn.cards.findIndex(card => card.id === cardId);
          if (cardIndex !== -1) {
            movedCard = { ...sourceColumn.cards[cardIndex], updatedAt: new Date() };
            sourceColumn.cards.splice(cardIndex, 1);
          }
        }

        // Add card to target column
        if (movedCard) {
          const targetColumn = newColumns.find(col => col.id === targetColumnId);
          if (targetColumn) {
            targetColumn.cards.push(movedCard);
          }
        }

        return newColumns;
      });

      toast({
        title: "Cliente movido",
        description: "O cliente foi movido para a nova coluna.",
      });
    } catch (error) {
      console.error('Error moving card:', error);
      toast({
        title: "Erro ao mover cliente",
        description: "Não foi possível mover o cliente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    columns,
    isLoaded,
    addColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
  };
};