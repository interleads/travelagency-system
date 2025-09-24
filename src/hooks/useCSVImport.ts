import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ImportResult {
  success: number;
  errors: string[];
  suppliers: number;
}

interface SaleData {
  sale_date: string;
  client_name: string;
  total_amount: number;
  payment_method: string;
  notes?: string;
  supplier_id?: string;
  gross_profit?: number;
  miles_used?: number;
}

interface ProductData {
  type: string;
  name: string;
  price: number;
  cost: number;
  origin?: string;
  destination?: string;
  airline?: string;
  quantity: number;
}

export function useCSVImport() {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    
    // Format: DD/MM/AAAA
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const parseNumber = (value: string): number => {
    if (!value || value.trim() === '') return 0;
    
    // Remove R$, espaços e vírgulas decimais
    const cleanValue = value
      .replace(/R\$\s?/, '')
      .replace(/\./g, '') // Remove pontos de milhares
      .replace(',', '.') // Converte vírgula decimal para ponto
      .trim();
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const normalizePaymentMethod = (method: string): string => {
    if (!method) return 'Outros';
    
    const normalized = method.toLowerCase().trim();
    
    if (normalized.includes('infinity') || normalized.includes('infinte') || 
        normalized.includes('sumup') || normalized.includes('mercado pago')) {
      return 'Cartão';
    }
    
    if (normalized.includes('pix')) return 'PIX';
    if (normalized.includes('cliente')) return 'Cliente';
    
    return method;
  };

  const splitRoute = (route: string): { origin?: string; destination?: string } => {
    if (!route || route.trim() === '') return {};
    
    const parts = route.split('-').map(part => part.trim());
    
    if (parts.length >= 2) {
      return {
        origin: parts[0],
        destination: parts.slice(1).join('-')
      };
    }
    
    return { destination: route };
  };

  const createOrGetSupplier = async (supplierName: string, airline: string): Promise<string | null> => {
    if (!supplierName || supplierName.trim() === '') return null;

    // Verifica se o fornecedor já existe
    const { data: existingSupplier, error: searchError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('name', supplierName.trim())
      .maybeSingle();

    if (searchError) {
      console.error('Erro ao buscar fornecedor:', searchError);
      return null;
    }

    if (existingSupplier) {
      return existingSupplier.id;
    }

    // Cria novo fornecedor
    const { data: newSupplier, error: createError } = await supabase
      .from('suppliers')
      .insert({
        name: supplierName.trim(),
        contact: 'Importado automaticamente',
        account_type: 'Fornecedor',
        program: airline || 'N/A',
        status: 'Ativo'
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Erro ao criar fornecedor:', createError);
      return null;
    }

    return newSupplier.id;
  };

  const importCSVMutation = useMutation({
    mutationFn: async (file: File): Promise<ImportResult> => {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 3) {
        throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
      }

      // Pular as duas primeiras linhas (cabeçalhos)
      const dataLines = lines.slice(2);
      const result: ImportResult = { success: 0, errors: [], suppliers: 0 };
      const createdSuppliers = new Set<string>();

      for (let i = 0; i < dataLines.length; i++) {
        try {
          setProgress(Math.round((i / dataLines.length) * 100));
          
          const columns = parseCSVLine(dataLines[i]);
          
          // Mapeamento das colunas baseado no CSV fornecido
          const [
            , // PASSAGENS AÉREAS (ignorar) - 0
            dateStr, // DATA DA VENDA - 1
            route, // TRECHO - 2
            , // DATA T1 (ignorar) - 3
            , // DATA T2 (ignorar) - 4
            clientName, // PAX - 5
            , // LOC (ignorar) - 6
            , // MALA (ignorar) - 7
            airline, // CIA - 8
            supplierName, // CONTA USADA - 9
            txEmbStr, // TX EMB - 10
            cardTaxStr, // CARTAO TX - 11
            milesQtyStr, // QTD MILHAS - 12
            costStr, // CUSTO (k) - 13
            revenueStr, // FATURAMENTO - 14
            profitStr, // LUCRO - 15
            paymentMethod, // PGTO - 16
            status, // STATUS - 17
            , // COMISSÃO (ignorar) - 18
            description // DESCRIÇÃO - 19
          ] = columns;

          console.log(`Linha ${i + 3}:`, {
            clientName,
            paymentMethod,
            status,
            dateStr,
            revenueStr,
            profitStr,
            milesQtyStr,
            cardTaxStr
          });

          // Validações básicas
          if (!clientName || !revenueStr) {
            result.errors.push(`Linha ${i + 3}: Dados obrigatórios faltando (PAX ou FATURAMENTO)`);
            continue;
          }

          const parsedDate = parseDate(dateStr);
          const revenue = parseNumber(revenueStr);
          const cost = parseNumber(costStr);
          const txEmb = parseNumber(txEmbStr);
          const cardTax = parseNumber(cardTaxStr);
          const milesUsed = milesQtyStr ? parseNumber(milesQtyStr) * 1000 : 0;
          const grossProfit = profitStr ? parseNumber(profitStr) : (revenue - cost - txEmb - cardTax);
          const saleStatus = status && status.trim().toLowerCase() === 'pago' ? 'paid' : 'pending';

          if (revenue <= 0) {
            result.errors.push(`Linha ${i + 3}: Faturamento inválido`);
            continue;
          }

          // Não usar data atual se a data estiver vazia - pular a linha
          if (!parsedDate) {
            result.errors.push(`Linha ${i + 3}: Data da venda é obrigatória`);
            continue;
          }

          // Criar ou buscar fornecedor
          let supplierId: string | null = null;
          if (supplierName && supplierName.trim() !== '') {
            supplierId = await createOrGetSupplier(supplierName, airline);
            if (supplierId && !createdSuppliers.has(supplierName)) {
              createdSuppliers.add(supplierName);
              result.suppliers++;
            }
          }

          // Preparar dados da venda
          const saleData: SaleData = {
            sale_date: parsedDate,
            client_name: clientName.trim(),
            total_amount: revenue,
            payment_method: normalizePaymentMethod(paymentMethod),
            notes: description && description.trim() !== '' ? description.trim() : undefined,
            supplier_id: supplierId,
            gross_profit: grossProfit,
            miles_used: milesUsed > 0 ? milesUsed : undefined
          };

          // Inserir venda
          const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert(saleData)
            .select('id')
            .single();

          if (saleError) {
            result.errors.push(`Linha ${i + 3}: Erro ao criar venda - ${saleError.message}`);
            continue;
          }

          // Preparar dados do produto
          const { origin, destination } = splitRoute(route);
          const totalProductCost = cost + txEmb + cardTax;
          const productData: ProductData = {
            type: 'passagem',
            name: 'Passagem Aérea',
            price: revenue,
            cost: totalProductCost,
            origin,
            destination,
            airline: airline && airline.trim() !== '' ? airline.trim() : undefined,
            quantity: 1
          };

          // Inserir produto da venda
          const { error: productError } = await supabase
            .from('sale_products')
            .insert({
              sale_id: sale.id,
              ...productData
            });

          if (productError) {
            result.errors.push(`Linha ${i + 3}: Erro ao criar produto - ${productError.message}`);
            continue;
          }

          result.success++;
        } catch (error) {
          result.errors.push(`Linha ${i + 3}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      setProgress(100);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    }
  });

  return {
    importCSV: importCSVMutation.mutateAsync,
    isLoading: importCSVMutation.isPending,
    progress
  };
}