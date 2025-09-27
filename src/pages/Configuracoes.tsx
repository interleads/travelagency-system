import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Settings, Users, 
  Plus, MoreHorizontal, Edit, UserX, UserCheck, Trash2, Save, AlertTriangle, RotateCcw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClearAllDataDialog } from "@/components/shared/ClearAllDataDialog";
import { useProfiles, Profile } from "@/hooks/useProfiles";
import { UserForm } from "@/components/configuracoes/UserForm";

const Configuracoes = () => {
  const { toast } = useToast();
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { profiles, isLoading, createUser, updateProfile, toggleUserStatus, deleteUser } = useProfiles();

  const handleCreateUser = async (userData: any) => {
    setFormLoading(true);
    try {
      await createUser(userData);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!editingUser) return;
    
    setFormLoading(true);
    try {
      await updateProfile(editingUser.id, userData);
      setEditingUser(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    await toggleUserStatus(userId, !currentStatus);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    await deleteUser(deleteUserId);
    setDeleteUserId(null);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas!",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h2>
      </div>
      
      <Tabs defaultValue="usuarios">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Usuários
              </CardTitle>
              <Button onClick={() => setUserFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Carregando usuários...
                      </TableCell>
                    </TableRow>
                  ) : profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.full_name}</TableCell>
                        <TableCell>{profile.phone || '-'}</TableCell>
                        <TableCell className="capitalize">{profile.role}</TableCell>
                        <TableCell>
                          <Badge variant={profile.is_active ? "default" : "secondary"}>
                            {profile.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setEditingUser(profile);
                                  setUserFormOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(profile.id, profile.is_active)}
                              >
                                {profile.is_active ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteUserId(profile.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" defaultValue="Agência de Viagens" />
                  </div>
                  <div>
                    <Label htmlFor="company-email">E-mail da Empresa</Label>
                    <Input id="company-email" type="email" defaultValue="contato@agencia.com" />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Telefone</Label>
                    <Input id="company-phone" defaultValue="(11) 99999-9999" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Input id="timezone" defaultValue="America/Sao_Paulo" />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moeda Padrão</Label>
                    <Input id="currency" defaultValue="BRL" />
                  </div>
                  <div>
                    <Label htmlFor="backup-frequency">Frequência de Backup</Label>
                    <Input id="backup-frequency" defaultValue="Diário" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manutencao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Manutenção do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-2">Reset do Sistema</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta ação irá remover permanentemente todos os dados transacionais do sistema, incluindo:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 mb-4 ml-4">
                      <li>• Todas as vendas e produtos vendidos</li>
                      <li>• Inventário de milhas</li>
                      <li>• Transações financeiras</li>
                      <li>• Parcelamentos</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mb-4">
                      <strong>Dados preservados:</strong> Configurações do sistema, usuários e fornecedores.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={() => setClearDataDialogOpen(true)}
                      className="mt-2"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Sistema
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <UserForm
        open={userFormOpen}
        onOpenChange={(open) => {
          setUserFormOpen(open);
          if (!open) setEditingUser(null);
        }}
        onSubmit={editingUser ? handleEditUser : handleCreateUser}
        editingUser={editingUser}
        isLoading={formLoading}
      />

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClearAllDataDialog 
        open={clearDataDialogOpen}
        onOpenChange={setClearDataDialogOpen}
      />
    </>
  );
};

export default Configuracoes;