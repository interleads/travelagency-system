import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'create',
          userData: userData
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao criar usuário');

      // Update local state - the profile will be created by the trigger
      await loadProfiles();
      
      toast({
        title: "Usuário criado com sucesso!",
        description: `${userData.full_name} foi adicionado ao sistema.`
      });

      return data.user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message
      });
      throw error;
    }
  }, [toast, loadProfiles]);

  const updateProfile = useCallback(async (id: string, updates: EditUserData) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'update',
          userId: id,
          userData: updates
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao atualizar usuário');

      // Update local state
      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, ...data.data } : profile
      ));

      toast({
        title: "Usuário atualizado com sucesso!"
      });

      return data.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message
      });
      throw error;
    }
  }, [toast]);

  const toggleUserStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, is_active: isActive } : profile
      ));

      toast({
        title: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso!`
      });

      return data;
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar status do usuário",
        description: error.message
      });
      throw error;
    }
  }, [toast]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'delete',
          userId: id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao remover usuário');

      setProfiles(prev => prev.filter(profile => profile.id !== id));
      
      toast({
        title: "Usuário removido com sucesso!"
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover usuário",
        description: error.message
      });
      throw error;
    }
  }, [toast]);

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