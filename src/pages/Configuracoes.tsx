import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Users, Plus, Edit, Trash2, Save, AlertTriangle, RotateCcw, Pencil, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/components/auth/AuthProvider';
import { ClearAllDataDialog } from '@/components/shared/ClearAllDataDialog';

const Configuracoes = () => {
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });
  
  const { toast } = useToast();
  const { users, loading, updateUserRole, updateUserStatus, updateUserProfile } = useUsers();
  const { profile: currentUserProfile } = useAuth();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      phone: user.phone || '',
    });
    setEditUserDialogOpen(true);
  };

  const handleSaveUserProfile = async () => {
    if (!selectedUser) return;
    
    await updateUserProfile(selectedUser.id, editForm);
    setEditUserDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = async (userId: string, newRole: 'administrador' | 'vendedor') => {
    await updateUserRole(userId, newRole);
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    await updateUserStatus(userId, !currentStatus);
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
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie usuários do sistema e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Usuários cadastrados</h3>
                  <p className="text-sm text-muted-foreground">
                    {users.length} usuários encontrados
                  </p>
                </div>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Novos usuários se cadastram na tela de login
                </Button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: 'administrador' | 'vendedor') => 
                              handleRoleChange(user.id, value)
                            }
                            disabled={user.id === currentUserProfile?.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="administrador">Administrador</SelectItem>
                              <SelectItem value="vendedor">Vendedor</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(user.id, user.is_active)}
                              disabled={user.id === currentUserProfile?.id}
                            >
                              {user.is_active ? 
                                <UserX className="h-4 w-4 text-red-500" /> : 
                                <UserCheck className="h-4 w-4 text-green-500" />
                              }
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Altere os dados do usuário {selectedUser?.full_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUserProfile}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
      
      <ClearAllDataDialog 
        open={clearDataDialogOpen}
        onOpenChange={setClearDataDialogOpen}
      />
    </>
  );
};

export default Configuracoes;