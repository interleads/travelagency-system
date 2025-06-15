import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { 
  Settings, Users, Building2, Tags, 
  Plus, Edit, Trash2, Save 
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplierForm } from '@/components/finance/SupplierForm';
import { useCategories, useAddCategory } from "@/hooks/useCategories";
import { useProducts, useAddProduct } from "@/hooks/useProducts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const Configuracoes = () => {
  const { toast } = useToast();
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  // Novos estados para categorias/produtos
  const [newCategory, setNewCategory] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const [newProduct, setNewProduct] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [prodLoading, setProdLoading] = useState(false);

  // Hooks dos dados
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const addCategory = useAddCategory();
  const addProduct = useAddProduct();

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas!",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const handleSupplierSubmit = (data: any) => {
    // Adapte para sua lógica, se necessário.
    toast({
      title: "Fornecedor cadastrado com sucesso!",
      description: `${data.name} - ${data.category || data.program || ""}`,
    });
    setIsSupplierDialogOpen(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setCatLoading(true);
    addCategory.mutate(newCategory, {
      onSuccess: () => {
        toast({
          title: "Categoria criada!",
          description: `Categoria "${newCategory}" cadastrada com sucesso.`,
        });
        setNewCategory("");
      },
      onError: (err) => {
        toast({
          title: "Erro ao salvar categoria",
          description: (err as any).message,
          variant: "destructive",
        });
      },
      onSettled: () => setCatLoading(false),
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim() || !productCategory) return;
    setProdLoading(true);
    addProduct.mutate({ name: newProduct, category_id: productCategory }, {
      onSuccess: () => {
        toast({
          title: "Produto criado!",
          description: `Produto "${newProduct}" cadastrado com sucesso.`,
        });
        setNewProduct("");
        setProductCategory("");
      },
      onError: (err) => {
        toast({
          title: "Erro ao salvar produto",
          description: (err as any).message,
          variant: "destructive",
        });
      },
      onSettled: () => setProdLoading(false),
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h2>
      </div>
      
      <Tabs defaultValue="usuarios">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores Padrão</TabsTrigger>
          <TabsTrigger value="categorias">Produtos & Categorias</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestão de Usuários
              </CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>João Silva</TableCell>
                    <TableCell>joao@agencia.com</TableCell>
                    <TableCell>Administrador</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                        Ativo
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maria Santos</TableCell>
                    <TableCell>maria@agencia.com</TableCell>
                    <TableCell>Vendedor</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                        Ativo
                      </span>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fornecedores">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Fornecedores Padrão
              </CardTitle>
              {/* Botão que abre o modal */}
              <Button onClick={() => setIsSupplierDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Companhias Aéreas</h4>
                  {["LATAM", "GOL", "Azul", "Air France", "TAP"].map((airline) => (
                    <div key={airline} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{airline}</span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Contas de Milhas</h4>
                  {["Conta Azul - João", "Conta SMILES - Ana", "Conta TudoAzul - Carlos"].map((account) => (
                    <div key={account} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{account}</span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Modal com SupplierForm */}
          <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Fornecedor</DialogTitle>
              </DialogHeader>
              <SupplierForm onSubmit={handleSupplierSubmit} />
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="categorias">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Produtos & Categorias
              </CardTitle>
              <div className="flex flex-row gap-2">
                {/* Botão de exemplo: formulários são integrados abaixo */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formulário de Categoria */}
                <div>
                  <h4 className="font-medium mb-3">Cadastrar Nova Categoria</h4>
                  <form onSubmit={handleAddCategory} className="flex flex-row gap-2 mb-4">
                    <Input
                      placeholder="Nome da Categoria"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      disabled={catLoading}
                    />
                    <Button type="submit" disabled={catLoading || !newCategory}>
                      {catLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="mr-2 h-4 w-4" />}
                      Salvar
                    </Button>
                  </form>
                  <h4 className="font-normal mb-2">Categorias Cadastradas</h4>
                  <div className="space-y-2">
                    {loadingCategories ? (
                      <div className="flex items-center text-gray-500"><Loader2 className="animate-spin w-4 h-4 mr-2" />Carregando...</div>
                    ) : (
                      categories.map((cat: any) => (
                        <div key={cat.id} className="flex items-center px-3 py-2 border rounded text-sm bg-muted justify-between">
                          <span>{cat.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* Formulário de Produto */}
                <div>
                  <h4 className="font-medium mb-3">Cadastrar Novo Produto</h4>
                  <form onSubmit={handleAddProduct} className="flex flex-col gap-2 mb-4">
                    <Input
                      placeholder="Nome do Produto"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      disabled={prodLoading}
                    />
                    <Select value={productCategory} onValueChange={setProductCategory} disabled={prodLoading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem value={cat.id} key={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" disabled={prodLoading || !newProduct || !productCategory}>
                      {prodLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="mr-2 h-4 w-4" />}
                      Salvar
                    </Button>
                  </form>
                  <h4 className="font-normal mb-2">Produtos Cadastrados</h4>
                  <div className="space-y-2">
                    {loadingProducts ? (
                      <div className="flex items-center text-gray-500"><Loader2 className="animate-spin w-4 h-4 mr-2" />Carregando...</div>
                    ) : (
                      products.map((prod: any) => (
                        <div key={prod.id} className="flex items-center px-3 py-2 border rounded text-sm bg-muted justify-between">
                          <span>
                            {prod.name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({prod.categories?.name || "Sem categoria"})
                            </span>
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
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
      </Tabs>
    </DashboardLayout>
  );
};

export default Configuracoes;
