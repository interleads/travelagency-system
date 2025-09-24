import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

// Column mapping based on CSV headers
const COLUMN_MAPPING: Record<string, string> = {
  'PASSAGENS AÉREAS': 'type',
  'DATA DA VENDA': 'sale_date',
  'TRECHO': 'route',
  'DATA T1': 'date_t1',
  'DATA T2': 'date_t2', 
  'PAX': 'client_name',
  'LOC': 'locator',
  'MALA': 'baggage',
  'CIA': 'airline',
  'CONTA USADA': 'supplier',
  'TX EMB': 'tx_emb',
  'CARTAO TX': 'card_tax',
  'QTD MILHAS': 'miles_qty',
  'CUSTO (k)': 'cost',
  'FATURAMENTO': 'revenue',
  'LUCRO': 'profit',
  'PGTO': 'payment_method',
  'STATUS': 'status',
  'COMISSÃO': 'commission',
  'DESCRIÇÃO': 'description'
};

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

  // Preview CSV data without importing
  const previewCSV = async (file: File): Promise<PreviewData> => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 3) {
      throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
    }

    // Get headers from second line (first line is often title)
    const headerLine = lines[1];
    const headers = parseCSVLine(headerLine);
    const detectedHeaders = headers.filter(h => h.trim() !== '');

    // Create column index mapping
    const columnIndexes: Record<string, number> = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.trim().toUpperCase();
      const mappedField = Object.keys(COLUMN_MAPPING).find(key => 
        key.toUpperCase() === normalizedHeader || 
        normalizedHeader.includes(key.split(' ')[0])
      );
      if (mappedField) {
        columnIndexes[COLUMN_MAPPING[mappedField]] = index;
      }
    });

    // Process sample rows
    const dataLines = lines.slice(2);
    let totalRevenue = 0;
    let totalProfit = 0;
    const sampleRows: PreviewData['sampleRows'] = [];

    for (let i = 0; i < Math.min(5, dataLines.length); i++) {
      const columns = parseCSVLine(dataLines[i]);
      
      const clientName = columns[columnIndexes.client_name] || '';
      const revenueStr = columns[columnIndexes.revenue] || '';
      const profitStr = columns[columnIndexes.profit] || '';
      const paymentMethod = columns[columnIndexes.payment_method] || '';
      const status = columns[columnIndexes.status] || '';
      const saleDateStr = columns[columnIndexes.sale_date] || '';

      if (clientName && revenueStr) {
        const revenue = parseNumber(revenueStr);
        const profit = parseNumber(profitStr);
        
        sampleRows.push({
          client_name: clientName,
          revenue,
          profit,
          payment_method: paymentMethod,
          status,
          sale_date: saleDateStr
        });
      }
    }

    // Calculate totals for all rows
    for (let i = 0; i < dataLines.length; i++) {
      const columns = parseCSVLine(dataLines[i]);
      const revenueStr = columns[columnIndexes.revenue] || '';
      const profitStr = columns[columnIndexes.profit] || '';
      
      if (revenueStr) {
        totalRevenue += parseNumber(revenueStr);
        totalProfit += parseNumber(profitStr);
      }
    }

    return {
      totalRevenue,
      totalProfit,
      sampleRows,
      detectedHeaders,
      rowCount: dataLines.length
    };
  };

  // Clear all imported sales
  const clearImports = async (): Promise<void> => {
    const { error } = await supabase
      .from('sales')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
      throw new Error(`Erro ao limpar dados: ${error.message}`);
    }
  };

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

      // Get headers and create column mapping
      const headerLine = lines[1];
      const headers = parseCSVLine(headerLine);
      
      const columnIndexes: Record<string, number> = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.trim().toUpperCase();
        const mappedField = Object.keys(COLUMN_MAPPING).find(key => 
          key.toUpperCase() === normalizedHeader || 
          normalizedHeader.includes(key.split(' ')[0])
        );
        if (mappedField) {
          columnIndexes[COLUMN_MAPPING[mappedField]] = index;
        }
      });

      console.log('Detected column mapping:', columnIndexes);

      const dataLines = lines.slice(2);
      const result: ImportResult = { success: 0, errors: [], suppliers: 0 };
      const createdSuppliers = new Set<string>();

      for (let i = 0; i < dataLines.length; i++) {
        try {
          setProgress(Math.round((i / dataLines.length) * 100));
          
          const columns = parseCSVLine(dataLines[i]);
          
          // Extract data using header-based mapping
          const clientName = columns[columnIndexes.client_name] || '';
          const dateStr = columns[columnIndexes.sale_date] || '';
          const route = columns[columnIndexes.route] || '';
          const airline = columns[columnIndexes.airline] || '';
          const supplierName = columns[columnIndexes.supplier] || '';
          const txEmbStr = columns[columnIndexes.tx_emb] || '';
          const cardTaxStr = columns[columnIndexes.card_tax] || '';
          const milesQtyStr = columns[columnIndexes.miles_qty] || '';
          const costStr = columns[columnIndexes.cost] || '';
          const revenueStr = columns[columnIndexes.revenue] || '';
          const profitStr = columns[columnIndexes.profit] || '';
          const paymentMethod = columns[columnIndexes.payment_method] || '';
          const status = columns[columnIndexes.status] || '';
          const description = columns[columnIndexes.description] || '';

          console.log(`Linha ${i + 3}:`, {
            clientName,
            paymentMethod,
            status,
            dateStr,
            revenueStr,
            profitStr,
            airline
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

          // Create installments based on status
          const saleStatus = status && status.trim().toLowerCase() === 'pago' ? 'paid' : 'pending';
          const { error: installmentError } = await supabase
            .from('sale_installments')
            .insert({
              sale_id: sale.id,
              installment_number: 1,
              due_date: parsedDate,
              amount: revenue,
              status: saleStatus,
              paid_date: saleStatus === 'paid' ? parsedDate : null
            });

          if (installmentError) {
            console.warn(`Erro ao criar parcela para venda ${sale.id}:`, installmentError);
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
    progress,
    previewCSV,
    clearImports
  };
}