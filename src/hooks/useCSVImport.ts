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

// Normalize text for comparison (remove accents, punctuation, convert to uppercase)
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toUpperCase();
};

// Robust column mapping with exact synonyms for each field
const FIELD_SYNONYMS: Record<string, string[]> = {
  sale_date: [
    'DATA DA VENDA', 
    'DATA VENDA',
    'DATA DE VENDA'
  ],
  client_name: [
    'PAX', 
    'CLIENTE', 
    'NOME DO PASSAGEIRO',
    'PASSAGEIRO'
  ],
  total_amount: [
    'FATURAMENTO', 
    'VALOR', 
    'VALOR TOTAL',
    'RECEITA'
  ],
  gross_profit: [
    'LUCRO',
    'MARGEM',
    'PROFIT'
  ],
  payment_method: [
    'PGTO', 
    'PAGAMENTO', 
    'FORMA DE PAGAMENTO',
    'METODO DE PAGAMENTO',
    'TIPO DE PAGAMENTO'
  ],
  status: [
    'STATUS',
    'SITUACAO',
    'SITUAÇÃO'
  ],
  route: [
    'TRECHO', 
    'ROTA',
    'TRAJETO'
  ],
  airline: [
    'CIA', 
    'CIA AÉREA', 
    'CIA AEREA', 
    'COMPANHIA',
    'COMPANHIA AEREA'
  ],
  supplier: [
    'CONTA USADA', 
    'FORNECEDOR',
    'SUPPLIER'
  ],
  miles_qty: [
    'QTD MILHAS', 
    'MILHAS',
    'QUANTIDADE MILHAS'
  ],
  cost: [
    'CUSTO', 
    'CUSTO (K)',
    'CUSTO K'
  ],
  tx_emb: [
    'TX EMB', 
    'TX DE EMBARQUE', 
    'TX EMBARQUE',
    'TAXA EMBARQUE'
  ],
  card_tax: [
    'CARTÃO TX', 
    'CARTAO TX', 
    'TAXA CARTÃO', 
    'TAXA CARTAO',
    'TX CARTAO'
  ],
  description: [
    'DESCRIÇÃO', 
    'DESCRICAO', 
    'OBS', 
    'OBSERVAÇÃO', 
    'OBSERVACAO'
  ]
};

const parseCSVLine = (line: string, delimiter: ',' | ';' = ','): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(c => c.replace(/\r$/, ''));
};

const preprocessCSVContent = (
  text: string
): { lines: string[]; originalLineNumbers: number[]; delimiterHint?: ',' | ';' } => {
  const rawLines = text.split(/\r?\n/);
  const lines: string[] = [];
  const originalLineNumbers: number[] = [];
  let delimiterHint: ',' | ';' | undefined;

  rawLines.forEach((rawLine, index) => {
    const withoutBom = rawLine.replace(/^\ufeff/, '');
    const trimmed = withoutBom.trim();

    if (trimmed === '') {
      return;
    }

    if (trimmed.toLowerCase().startsWith('sep=')) {
      const candidate = trimmed.slice(4).trim()[0];
      if (candidate === ',' || candidate === ';') {
        delimiterHint = candidate as ',' | ';';
      }
      return;
    }

    lines.push(withoutBom);
    originalLineNumbers.push(index);
  });

  return { lines, originalLineNumbers, delimiterHint };
};

// Map header to field using exact synonym matching
const mapHeaderToField = (header: string): string | null => {
  const normalized = normalizeText(header);
  
  for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (normalized === normalizeText(synonym)) {
        return field;
      }
    }
  }
  
  return null;
};

// Detect CSV delimiter by checking recognized header tokens in the first few lines
const detectDelimiter = (lines: string[], hint?: ',' | ';'): ',' | ';' => {
  if (hint) {
    return hint;
  }

  const candidates: Array<',' | ';'> = [',', ';'];
  let best: ',' | ';' = ',';
  let bestScore = -1;
  let bestDelimiterHits = -1;

  for (const delim of candidates) {
    let score = 0;
    let delimiterHits = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      delimiterHits += line.split(delim).length - 1;
      const cols = parseCSVLine(line, delim);
      for (const col of cols) {
        if (mapHeaderToField(col)) {
          score++;
        }
      }
    }
    if (score > bestScore || (score === bestScore && delimiterHits > bestDelimiterHits)) {
      bestScore = score;
      bestDelimiterHits = delimiterHits;
      best = delim;
    }
  }

  return best;
};

// Find which line contains the header row
const findHeaderIndex = (lines: string[], delimiter: ',' | ';'): number => {
  let bestIndex = 1; // common case
  let bestScore = -1;
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    let score = 0;
    
    // Count recognized headers
    for (const col of cols) {
      if (mapHeaderToField(col)) {
        score++;
      }
    }
    
    // Bonus for critical headers
    const criticalHeaders = ['PAX', 'FATURAMENTO', 'PGTO', 'DATA DA VENDA'];
    const hasCritical = cols.some(col => 
      criticalHeaders.some(critical => 
        normalizeText(col).includes(normalizeText(critical))
      )
    );
    if (hasCritical) score += 2;
    
    // Require minimum 3 recognized headers
    if (score >= 3 && score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }
  
  return bestIndex;
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
    const { lines, delimiterHint } = preprocessCSVContent(text);

    if (lines.length < 2) {
      throw new Error('Arquivo CSV deve ter cabeçalho e pelo menos uma linha de dados');
    }

    // Detect delimiter and header row
    const delimiter = detectDelimiter(lines, delimiterHint);
    const headerIndex = findHeaderIndex(lines, delimiter);
    const headerLine = lines[headerIndex];
    const headers = parseCSVLine(headerLine, delimiter);
    const detectedHeaders = headers.filter(h => h.trim() !== '');

    // Create column index mapping using robust header matching
    const columnIndexes: Record<string, number> = {};
    headers.forEach((header, index) => {
      const field = mapHeaderToField(header);
      if (field) {
        columnIndexes[field] = index;
      }
    });

    console.log('Detected headers:', detectedHeaders);
    console.log('Column mapping:', columnIndexes);

    // Process sample rows
    const dataLines = lines.slice(headerIndex + 1);
    let totalRevenue = 0;
    let totalProfit = 0;
    const sampleRows: PreviewData['sampleRows'] = [];

    for (let i = 0; i < Math.min(5, dataLines.length); i++) {
      const columns = parseCSVLine(dataLines[i], delimiter);
      const clientName = columns[columnIndexes.client_name] || '';
      const revenueStr = columns[columnIndexes.total_amount] || '';
      const profitStr = columns[columnIndexes.gross_profit] || '';
      const paymentMethod = columns[columnIndexes.payment_method] || '';
      const status = columns[columnIndexes.status] || '';
      const saleDateStr = columns[columnIndexes.sale_date] || '';
      const parsedSaleDate = parseDate(saleDateStr) || saleDateStr;

      if (clientName && revenueStr) {
        const revenue = parseNumber(revenueStr);
        const profit = parseNumber(profitStr);
        sampleRows.push({
          client_name: clientName,
          revenue,
          profit,
          payment_method: paymentMethod,
          status,
          sale_date: parsedSaleDate
        });
      }
    }

    // Calculate totals for all rows
    for (let i = 0; i < dataLines.length; i++) {
      const columns = parseCSVLine(dataLines[i], delimiter);
      const revenueStr = columns[columnIndexes.total_amount] || '';
      const profitStr = columns[columnIndexes.gross_profit] || '';
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

// Clear all imported sales and related records
const clearImports = async (): Promise<void> => {
  // Delete child records first to avoid FK issues
  const [prodRes, instRes] = await Promise.all([
    supabase.from('sale_products').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('sale_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  ]);

  // Miles transactions: delete only those linked to sales
  const { error: milesTxError } = await supabase
    .from('miles_transactions')
    .delete()
    .not('sale_id', 'is', null);
  if (milesTxError) {
    throw new Error(`Erro ao limpar transações de milhas: ${milesTxError.message}`);
  }

  if (prodRes.error) throw new Error(`Erro ao limpar produtos: ${prodRes.error.message}`);
  if (instRes.error) throw new Error(`Erro ao limpar parcelas: ${instRes.error.message}`);

  // Finally delete sales
  const { error: salesError } = await supabase
    .from('sales')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (salesError) {
    throw new Error(`Erro ao limpar vendas: ${salesError.message}`);
  }
};

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    
    const trimmed = dateStr.trim();
    
    // Try multiple date formats
    // Format: DD/MM/YYYY or DD/MM/YY
    let dateParts = trimmed.split('/');
    if (dateParts.length === 3) {
      let [day, month, year] = dateParts;
      
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum > 50 ? `19${year}` : `20${year}`;
      }
      
      if (day.length <= 2 && month.length <= 2 && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Format: DD-MM-YYYY or DD-MM-YY
    dateParts = trimmed.split('-');
    if (dateParts.length === 3) {
      let [day, month, year] = dateParts;
      
      // Check if it's YYYY-MM-DD format (ISO)
      if (day.length === 4) {
        [year, month, day] = dateParts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Convert 2-digit year to 4-digit for DD-MM-YY
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum > 50 ? `19${year}` : `20${year}`;
      }
      
      if (day.length <= 2 && month.length <= 2 && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return null;
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

  const normalizePaymentMethod = (method: string, status?: string): string => {
    if (!method || method.trim() === '') {
      // If payment method is empty but status is "PAGO", don't use "PAGO" as payment method
      return 'Outros';
    }
    
    const normalized = method.toLowerCase().trim();
    
    // Don't treat status values as payment methods
    if (normalized === 'pago' || normalized === 'pendente' || normalized === 'cancelado') {
      return 'Outros';
    }

    if (
      normalized.includes('infinity') ||
      normalized.includes('infinte') ||
      normalized.includes('sumup') ||
      normalized.includes('mercado pago') ||
      normalized.includes('cartao') ||
      normalized.includes('cartão') ||
      normalized.includes('credito') ||
      normalized.includes('crédito') ||
      normalized.includes('debito') ||
      normalized.includes('débito')
    ) {
      return 'Cartão';
    }

    if (normalized.includes('pix')) return 'PIX';
    if (normalized.includes('cliente')) return 'Cliente';
    if (normalized.includes('dinheiro')) return 'Dinheiro';
    if (normalized.includes('boleto')) return 'Boleto';

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
      const { lines, originalLineNumbers, delimiterHint } = preprocessCSVContent(text);

      if (lines.length < 2) {
        throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
      }

      // Detect delimiter and header row, then create column mapping
      const delimiter = detectDelimiter(lines, delimiterHint);
      const headerIndex = findHeaderIndex(lines, delimiter);
      const headers = parseCSVLine(lines[headerIndex], delimiter);
      
      // Create robust column mapping using exact header matching
      const columnIndexes: Record<string, number> = {};
      headers.forEach((header, index) => {
        const field = mapHeaderToField(header);
        if (field) {
          columnIndexes[field] = index;
        }
      });

      console.log('Detected delimiter:', delimiter, 'headerIndex:', headerIndex, 'column mapping:', columnIndexes);

      const dataLines = lines.slice(headerIndex + 1);
      const dataLineNumbers = originalLineNumbers.slice(headerIndex + 1);
      const result: ImportResult = { success: 0, errors: [], suppliers: 0 };
      const createdSuppliers = new Set<string>();

      for (let i = 0; i < dataLines.length; i++) {
        const rowNumber = (dataLineNumbers[i] ?? headerIndex + 1 + i) + 1;
        try {
          setProgress(Math.round((i / dataLines.length) * 100));

          const columns = parseCSVLine(dataLines[i], delimiter);

          // Extract data using robust header-based mapping
          const clientName = columns[columnIndexes.client_name] || '';
          const dateStr = columns[columnIndexes.sale_date] || '';
          const route = columns[columnIndexes.route] || '';
          const airline = columns[columnIndexes.airline] || '';
          const supplierName = columns[columnIndexes.supplier] || '';
          const txEmbStr = columns[columnIndexes.tx_emb] || '';
          const cardTaxStr = columns[columnIndexes.card_tax] || '';
          const milesQtyStr = columns[columnIndexes.miles_qty] || '';
          const costStr = columns[columnIndexes.cost] || '';
          const revenueStr = columns[columnIndexes.total_amount] || '';
          const profitStr = columns[columnIndexes.gross_profit] || '';
          const paymentMethod = columns[columnIndexes.payment_method] || '';
          const status = columns[columnIndexes.status] || '';
          const description = columns[columnIndexes.description] || '';

          console.log(`Linha ${rowNumber}:`, {
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
            result.errors.push(`Linha ${rowNumber}: Dados obrigatórios faltando (PAX ou FATURAMENTO)`);
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
            result.errors.push(`Linha ${rowNumber}: Faturamento inválido`);
            continue;
          }

          // Não usar data atual se a data estiver vazia - pular a linha
          if (!parsedDate) {
            result.errors.push(`Linha ${rowNumber}: Data da venda é obrigatória`);
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
            payment_method: normalizePaymentMethod(paymentMethod, status),
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
            result.errors.push(`Linha ${rowNumber}: Erro ao criar venda - ${saleError.message}`);
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
            result.errors.push(`Linha ${rowNumber}: Erro ao criar produto - ${productError.message}`);
            continue;
          }

          result.success++;
        } catch (error) {
          result.errors.push(`Linha ${rowNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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