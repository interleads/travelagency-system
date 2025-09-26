import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'administrador' | 'vendedor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with auth user data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // For now, we'll use a different approach since admin functions require service role
      // We'll get the email from the current session or use a placeholder
      const { data: { session } } = await supabase.auth.getSession();
      
      // Combine profile data with email (we can enhance this later)
      const combinedUsers = profiles?.map(profile => ({
        ...profile,
        email: session?.user?.id === profile.id ? session.user.email || '' : 'user@example.com',
      })) || [];

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'administrador' | 'vendedor') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));

      toast({
        title: "Permissão atualizada",
        description: "A permissão do usuário foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserStatus = async (userId: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active } : user
      ));

      toast({
        title: is_active ? "Usuário ativado" : "Usuário desativado",
        description: `O usuário foi ${is_active ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<Pick<User, 'full_name' | 'phone'>>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      toast({
        title: "Perfil atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    updateUserRole,
    updateUserStatus,
    updateUserProfile,
  };
}