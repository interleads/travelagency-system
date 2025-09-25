import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCRMSupabase } from './useCRMSupabase';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { addCard, columns } = useCRMSupabase();

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [...prev, data]);
      
      // Criar card no CRM na coluna "CLIENTES" (aguardar loading dos dados do CRM)
      try {
        const clientesColumn = columns.find(col => col.title.toLowerCase() === 'clientes');
        if (clientesColumn) {
          await addCard(clientesColumn.id, {
            title: clientData.name,
            client: clientData.name,
            email: clientData.email || '',
            phone: clientData.phone || '',
            description: `Novo cliente cadastrado`,
            priority: 'medium',
            labels: [{ id: 'novo-cliente', name: 'Novo Cliente', color: 'green' }],
            checklist: []
          });
        }
      } catch (crmError) {
        console.warn('Não foi possível criar card no CRM:', crmError);
        // Não bloqueia o cadastro do cliente se houver erro no CRM
      }

      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `${clientData.name} foi adicionado ao sistema.`
      });

      return data;
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar cliente",
        description: error.message
      });
      throw error;
    }
  }, [toast, addCard, columns]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ));

      toast({
        title: "Cliente atualizado com sucesso!"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cliente",
        description: error.message
      });
      throw error;
    }
  }, [toast]);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      
      toast({
        title: "Cliente removido com sucesso!"
      });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover cliente",
        description: error.message
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clients,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
    refetch: loadClients
  };
}