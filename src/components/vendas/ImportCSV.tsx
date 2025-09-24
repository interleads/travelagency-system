import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useCSVImport } from "@/hooks/useCSVImport";

interface ImportResult {
  success: number;
  errors: string[];
  suppliers: number;
}

export function ImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { importCSV, isLoading, progress } = useCSVImport();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const result = await importCSV(file);
      
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
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação. Tente novamente.",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Vendas via CSV</DialogTitle>
          <DialogDescription>
            Faça upload do arquivo CSV com os dados das vendas para importar automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Selecionar Arquivo
                </CardTitle>
                <CardDescription>
                  Escolha o arquivo CSV com os dados das vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{file.name} selecionado</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <div className="space-y-1">
                      <p><strong>Formato esperado:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>DATA DA VENDA (DD/MM/AAAA)</li>
                        <li>TRECHO (origem-destino)</li>
                        <li>PAX (nome do passageiro)</li>
                        <li>FATURAMENTO, CUSTO, TX EMB</li>
                        <li>CIA (companhia aérea)</li>
                        <li>CONTA USADA (fornecedor)</li>
                        <li>PGTO (método de pagamento)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Processando importação...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {progress}% concluído
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}