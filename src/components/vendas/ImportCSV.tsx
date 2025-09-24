import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Trash2, Eye, Settings } from "lucide-react";
import { useCSVImport } from "@/hooks/useCSVImport";
import { useToast } from "@/hooks/use-toast";
import { ColumnMappingDialog } from "@/components/csv/ColumnMappingDialog";

interface ImportResult {
  success: number;
  errors: string[];
  suppliers: number;
}

interface PreviewData {
  totalRevenue: number;
  totalProfit: number;
  sampleRows: Array<{
    client_name: string;
    revenue: number;
    profit: number;
    payment_method: string;
    status: string;
    sale_date: string;
  }>;
  detectedHeaders: string[];
  rowCount: number;
  uniqueRowCount: number;
  duplicatesDetected: number;
}

interface ColumnMapping {
  [systemField: string]: string | null;
}

export function ImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [manualMapping, setManualMapping] = useState<ColumnMapping>({});
  const { toast } = useToast();
  const { importCSV, isLoading, progress, previewCSV, clearImports } = useCSVImport();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setPreview(null);
      setShowPreview(false);
      setManualMapping({});
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = async (customMapping?: ColumnMapping) => {
    if (!file) return;
    
    try {
      const previewData = await previewCSV(file, customMapping);
      setPreview(previewData);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Erro no preview",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleMappingApply = (mapping: ColumnMapping) => {
    setManualMapping(mapping);
    handlePreview(mapping);
  };

  const handleClearImports = async () => {
    try {
      await clearImports();
      toast({
        title: "Dados limpos",
        description: "Todas as vendas importadas foram removidas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao limpar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const result = await importCSV(file, manualMapping);
      
      toast({
        title: "Importação concluída!",
        description: `${result.success} vendas importadas com sucesso. ${result.suppliers} fornecedores criados.`,
      });

      if (result.errors.length > 0) {
        console.log("Erros durante a importação:", result.errors);
        toast({
          title: "Alguns erros ocorreram",
          description: `${result.errors.length} linhas tiveram problemas. Verifique o console para detalhes.`,
          variant: "destructive",
        });
      }

      setFile(null);
      setPreview(null);
      setShowPreview(false);
      setManualMapping({});
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Vendas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar CSV de Vendas</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center">
              <p>Importando dados...</p>
              <Progress value={progress} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">{progress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            
            {file && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tamanho: {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            {file && !showPreview && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handlePreview()}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar Preview
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMappingDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Mapear Colunas
                </Button>
              </div>
            )}

            {preview && showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview dos Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {preview.duplicatesDetected > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>{preview.duplicatesDetected} linhas duplicadas</strong> foram detectadas e ignoradas no cálculo dos totais.
                        Apenas <strong>{preview.uniqueRowCount} linhas únicas</strong> foram processadas.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Faturamento</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(preview.totalRevenue)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Lucro</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(preview.totalProfit)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Linhas Únicas</p>
                      <p className="text-2xl font-bold">{preview.uniqueRowCount}</p>
                      {preview.duplicatesDetected > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ({preview.rowCount} total, {preview.duplicatesDetected} duplicatas)
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Primeiras 5 linhas:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-2 py-1 text-left">Cliente</th>
                            <th className="border border-gray-200 px-2 py-1 text-left">Data</th>
                            <th className="border border-gray-200 px-2 py-1 text-right">Faturamento</th>
                            <th className="border border-gray-200 px-2 py-1 text-right">Lucro</th>
                            <th className="border border-gray-200 px-2 py-1 text-left">Pagamento</th>
                            <th className="border border-gray-200 px-2 py-1 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.sampleRows.map((row, index) => (
                            <tr key={index}>
                              <td className="border border-gray-200 px-2 py-1">{row.client_name}</td>
                              <td className="border border-gray-200 px-2 py-1">{row.sale_date}</td>
                              <td className="border border-gray-200 px-2 py-1 text-right">
                                {formatCurrency(row.revenue)}
                              </td>
                              <td className="border border-gray-200 px-2 py-1 text-right">
                                {formatCurrency(row.profit)}
                              </td>
                              <td className="border border-gray-200 px-2 py-1">{row.payment_method}</td>
                              <td className="border border-gray-200 px-2 py-1">{row.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">
                      ⚠️ Verificar Totais:
                    </p>
                    <p className="text-sm text-yellow-700">
                      Faturamento detectado: {formatCurrency(preview.totalRevenue)} | 
                      Lucro detectado: {formatCurrency(preview.totalProfit)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMappingDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Ajustar Mapeamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Formato esperado:</p>
              <ul className="space-y-1 text-xs">
                <li>• Cabeçalhos na segunda linha</li>
                <li>• Colunas obrigatórias: PAX, FATURAMENTO</li>
                <li>• Data no formato DD/MM/AAAA</li>
                <li>• Valores monetários com vírgula decimal</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={handleClearImports}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Importações
              </Button>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!file || !showPreview}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
              </div>
            </div>
          </div>
        )}

        <ColumnMappingDialog
          isOpen={showMappingDialog}
          onClose={() => setShowMappingDialog(false)}
          onApply={handleMappingApply}
          csvColumns={preview?.detectedHeaders || []}
          initialMapping={manualMapping}
        />
      </DialogContent>
    </Dialog>
  );
}