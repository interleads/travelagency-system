
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelPackageForm from '@/components/TravelPackageForm';
import PackageTemplateGallery from "@/components/PackageTemplateGallery";

const Packages = () => {
  const [templateData, setTemplateData] = useState<any | null>(null);

  return (
    <>
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
              <TravelPackageForm templateData={templateData} />
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
              <PackageTemplateGallery onSelectTemplate={td => setTemplateData(td)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Packages;

