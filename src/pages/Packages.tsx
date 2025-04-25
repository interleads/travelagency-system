
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import TravelPackageForm from '@/components/TravelPackageForm';

const Packages = () => {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Gerenciamento de Pacotes</h2>
      
      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="create">Criar Pacote</TabsTrigger>
          <TabsTrigger value="list">Listar Pacotes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Gerador de Pacotes de Viagem</CardTitle>
            </CardHeader>
            <CardContent>
              <TravelPackageForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Pacotes Criados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Os pacotes criados aparecerão aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Pacotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Templates de pacotes aparecerão aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Packages;
