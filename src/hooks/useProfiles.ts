import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getMessageFromContextBody = (contextBody: unknown): string | null => {
  if (!contextBody) {
    return null;
  }

  if (typeof contextBody === 'string') {
    return contextBody;
  }

  if (isRecord(contextBody)) {
    if (typeof contextBody.error === 'string') {
      return contextBody.error;
    }

    if (typeof contextBody.message === 'string') {
      return contextBody.message;
    }

    if (typeof contextBody.details === 'string') {
      return contextBody.details;
    }
  }

  return null;
};

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'administrador' | 'vendedor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'administrador' | 'vendedor';
}

export interface EditUserData {
  email: string;
  password?: string;
  full_name: string;
  role: 'administrador' | 'vendedor';
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;

    if (!accessToken) {
      throw new Error('Sessão expirada. Faça login novamente para continuar.');
    }

    return {
      Authorization: `Bearer ${accessToken}`
    };
  }, []);

  const parseFunctionError = useCallback((error: unknown) => {
    if (!isRecord(error)) {
      return 'Erro desconhecido ao comunicar com o servidor.';
    }

    // Supabase edge function errors include context with body/response data
    const context = isRecord(error.context) ? error.context : undefined;
    const contextBody = context ? context.body ?? context.response : undefined;
    const bodyMessage = getMessageFromContextBody(contextBody);

    if (bodyMessage) {
      return bodyMessage;
    }

    if (context && typeof context.error === 'string') {
      return context.error;
    }

    const message = typeof error.message === 'string' ? error.message : undefined;

    if (message && message !== 'Edge Function returned a non-2xx status code') {
      return message;
    }

    return 'Erro desconhecido ao executar a operação.';
  }, []);

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (error: unknown) {
      console.error('Error loading profiles:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao carregar usuários'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      const headers = await getAuthHeaders();

      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'create',
          data: userData
        },
        headers
      });

      if (error) {
        throw new Error(parseFunctionError(error));
      }

      setProfiles(prev => [...prev, data]);

      toast({
        title: "Usuário criado com sucesso!",
        description: `${userData.full_name} foi adicionado ao sistema.`
      });

      return data;
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao criar usuário'
      });
      throw error;
    }
  }, [toast, getAuthHeaders, parseFunctionError]);

  const updateProfile = useCallback(async (id: string, updates: EditUserData) => {
    try {
      const headers = await getAuthHeaders();

      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'update',
          userId: id,
          data: updates
        },
        headers
      });

      if (error) {
        throw new Error(parseFunctionError(error));
      }

      // Update local state
      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, ...data } : profile
      ));

      toast({
        title: "Usuário atualizado com sucesso!"
      });

      return data;
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar usuário'
      });
      throw error;
    }
  }, [toast, getAuthHeaders, parseFunctionError]);

  const toggleUserStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const headers = await getAuthHeaders();

      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'toggle-status',
          userId: id,
          data: { isActive }
        },
        headers
      });

      if (error) {
        throw new Error(parseFunctionError(error));
      }

      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, is_active: isActive } : profile
      ));

      toast({
        title: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`
      });

      return data;
    } catch (error: unknown) {
      console.error('Error toggling user status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar status do usuário",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao alterar status do usuário'
      });
      throw error;
    }
  }, [toast, getAuthHeaders, parseFunctionError]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const headers = await getAuthHeaders();

      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'delete',
          userId: id
        },
        headers
      });

      if (error) {
        throw new Error(parseFunctionError(error));
      }

      setProfiles(prev => prev.filter(profile => profile.id !== id));
      
      toast({
        title: "Usuário removido com sucesso!"
      });
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao remover usuário'
      });
      throw error;
    }
  }, [toast, getAuthHeaders, parseFunctionError]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    isLoading,
    createUser,
    updateProfile,
    toggleUserStatus,
    deleteUser,
    refetch: loadProfiles
  };
}