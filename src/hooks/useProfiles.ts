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
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          is_active: true
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      setProfiles(prev => [...prev, profileData]);
      
      toast({
        title: "Usuário criado com sucesso!",
        description: `${userData.full_name} foi adicionado ao sistema.`
      });

      return profileData;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message
      });
      throw error;
    }
  }, [toast]);

  const updateProfile = useCallback(async (id: string, updates: EditUserData) => {
    try {
      // Separate profile updates from auth updates
      const { password, ...profileUpdates } = updates;
      
      // Update profile in profiles table (including email)
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update password in auth if provided
      if (password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          password: password
        });
        if (authError) throw authError;
      }

      // Update email in auth if it changed
      if (updates.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
          email: updates.email
        });
        if (authError) throw authError;
      }

      // Update local state
      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, ...data } : profile
      ));

      toast({
        title: "Usuário atualizado com sucesso!"
      });

      return data;
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
      // Delete from auth (this will cascade to profiles via RLS)
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

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