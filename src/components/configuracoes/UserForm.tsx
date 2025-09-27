import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CreateUserData, EditUserData, Profile } from '@/hooks/useProfiles';

const userSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  full_name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  role: z.enum(['administrador', 'vendedor'], {
    required_error: 'Função é obrigatória'
  })
});

const editUserSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().optional().refine(
    (val) => !val || val.length >= 8,
    { message: 'Senha deve ter pelo menos 8 caracteres' }
  ),
  full_name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  role: z.enum(['administrador', 'vendedor'], {
    required_error: 'Função é obrigatória'
  })
});

type UserFormData = z.infer<typeof userSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserData | EditUserData) => Promise<void>;
  editingUser?: Profile | null;
  isLoading: boolean;
}

export function UserForm({ open, onOpenChange, onSubmit, editingUser, isLoading }: UserFormProps) {
  const isEditing = !!editingUser;
  
  const form = useForm<UserFormData | EditUserFormData>({
    resolver: zodResolver(isEditing ? editUserSchema : userSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      role: 'vendedor'
    }
  });

  // Reset form when editingUser changes
  useEffect(() => {
    if (isEditing && editingUser) {
      form.reset({
        email: editingUser.email || '',
        password: '',
        full_name: editingUser.full_name || '',
        role: editingUser.role || 'vendedor'
      });
    } else if (!isEditing) {
      form.reset({
        email: '',
        password: '',
        full_name: '',
        role: 'vendedor'
      });
    }
  }, [editingUser, isEditing, form]);

  const handleSubmit = async (data: UserFormData | EditUserFormData) => {
    try {
      if (isEditing) {
        // Filter out empty password for edit mode
        const editData = { ...data };
        if (!editData.password) {
          delete editData.password;
        }
        await onSubmit(editData as EditUserData);
      } else {
        await onSubmit(data as CreateUserData);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="usuario@email.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Senha
                    {isEditing && <span className="text-sm font-normal text-muted-foreground ml-1">(deixe vazio para não alterar)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isEditing ? "Digite nova senha ou deixe vazio" : "Mínimo 8 caracteres"}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar' : 'Criar Usuário'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}