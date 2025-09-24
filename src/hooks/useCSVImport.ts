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
  uniqueRowCount: number;
  duplicatesDetected: number;
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
  // Dados da Venda Principal
  sale_date: ['DATA DA VENDA', 'DATA VENDA', 'DATA DE VENDA', 'DATA'],
  client_name: ['PAX', 'CLIENTE', 'NOME DO PASSAGEIRO', 'PASSAGEIRO', 'NOME'],
  total_amount: ['FATURAMENTO', 'VALOR', 'VALOR TOTAL', 'RECEITA', 'PRECO', 'PREÇO'],
  payment_method: ['PGTO', 'PAGAMENTO', 'FORMA DE PAGAMENTO', 'METODO DE PAGAMENTO', 'TIPO DE PAGAMENTO'],
  installments: ['PARCELAS', 'PRESTACOES', 'PRESTAÇÕES'],
  gross_profit: ['LUCRO', 'MARGEM', 'PROFIT'],
  phone: ['TELEFONE', 'FONE', 'CELULAR'],
  notes: ['OBSERVACOES', 'OBSERVAÇÕES', 'OBS', 'NOTAS'],
  supplier: ['CONTA USADA', 'FORNECEDOR', 'SUPPLIER'],
  has_anticipation: ['ANTECIPACAO', 'ANTECIPAÇÃO', 'TEM ANTECIPACAO'],
  anticipation_date: ['DATA ANTECIPACAO', 'DATA ANTECIPAÇÃO'],
  
  // Dados Gerais do Produto  
  product_type: ['TIPO', 'TIPO PRODUTO', 'CATEGORIA'],
  quantity: ['QTD', 'QUANTIDADE'],
  price: ['PRECO', 'PREÇO', 'VALOR UNITARIO', 'VALOR UNITÁRIO'],
  cost: ['CUSTO', 'CUSTO (K)', 'CUSTO K'],
  details: ['DETALHES', 'DESCRICAO', 'DESCRIÇÃO'],
  
  // Dados de Passagem Aérea
  ticket_type: ['TIPO PASSAGEM', 'TIPO TICKET'],
  airline: ['CIA', 'CIA AÉREA', 'CIA AEREA', 'COMPANHIA', 'COMPANHIA AEREA'],
  adults: ['ADULTOS', 'ADT'],
  children: ['CRIANCAS', 'CRIANÇAS', 'CHD'],
  origin: ['ORIGEM', 'PARTIDA', 'FROM'],
  destination: ['DESTINO', 'CHEGADA', 'TO'],
  departure_date: ['DATA IDA', 'DATA PARTIDA', 'TRECHO 1', 'TRECHO1'],
  return_date: ['DATA VOLTA', 'DATA RETORNO', 'TRECHO 2', 'TRECHO2'],
  tax_value: ['TX EMB', 'TX DE EMBARQUE', 'TX EMBARQUE', 'TAXA EMBARQUE', 'TAXAS'],
  card_taxes: ['CARTÃO TX', 'CARTAO TX', 'TAXA CARTÃO', 'TAXA CARTAO', 'TX CARTAO'],
  miles_qty: ['QTD MILHAS', 'MILHAS', 'QUANTIDADE MILHAS'],
  miles_cost_per_thousand: ['CUSTO MIL', 'CUSTO 1K', 'CUSTO POR 1000'],
  locator: ['LOCALIZADOR', 'CODIGO', 'CÓDIGO', 'PNR'],
  
  // Dados de Hotel
  checkin_date: ['CHECK IN', 'CHECKIN', 'DATA CHECKIN'],
  checkout_date: ['CHECK OUT', 'CHECKOUT', 'DATA CHECKOUT'],
  
  // Dados de Veículo
  vehicle_category: ['CATEGORIA VEICULO', 'CATEGORIA VEÍCULO', 'TIPO CARRO'],
  rental_period: ['PERIODO LOCACAO', 'PERÍODO LOCAÇÃO', 'PERIODO'],
  
  // Dados de Seguro
  coverage_type: ['TIPO COBERTURA', 'COBERTURA'],
  
  // Dados de Transfer
  transfer_origin: ['ORIGEM TRANSFER', 'ORIGEM TRANSLADO'],
  transfer_destination: ['DESTINO TRANSFER', 'DESTINO TRANSLADO'],
  transfer_datetime: ['DATA TRANSFER', 'DATA TRANSLADO', 'HORA TRANSFER'],
  vehicle_type: ['TIPO VEICULO', 'TIPO VEÍCULO'],
  
  // Dados de Passeios
  tour_location: ['LOCAL PASSEIO', 'LOCAL TOUR'],
  tour_date: ['DATA PASSEIO', 'DATA TOUR'],
  tour_duration: ['DURACAO', 'DURAÇÃO', 'TEMPO'],
  tour_people_count: ['NUMERO PESSOAS', 'NÚMERO PESSOAS', 'QTD PESSOAS'],
  
  // Campos legados para compatibilidade
  status: ['STATUS', 'SITUACAO', 'SITUAÇÃO'],
  route: ['TRECHO', 'ROTA', 'TRAJETO'],
  tx_emb: ['TX EMB', 'TX DE EMBARQUE', 'TX EMBARQUE', 'TAXA EMBARQUE'],
  card_tax: ['CARTÃO TX', 'CARTAO TX', 'TAXA CARTÃO', 'TAXA CARTAO', 'TX CARTAO'],
  description: ['DESCRIÇÃO', 'DESCRICAO', 'OBS', 'OBSERVAÇÃO', 'OBSERVACAO']
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
  installments?: number;
  notes?: string;
  phone?: string;
  supplier_id?: string;
  gross_profit?: number;
  miles_used?: number;
  miles_cost?: number;
  has_anticipation?: boolean;
  anticipation_date?: string;
  products: ProductData[];
}

interface ProductData {
  type: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
  details?: string;
  // Passagem fields
  ticketType?: string;
  airline?: string;
  adults?: number;
  children?: number;
  origin?: string;
  destination?: string;
  trecho1?: string;
  trecho2?: string;
  taxValue?: number;
  cardTaxes?: string;
  qtdMilhas?: number;
  custoMil?: number;
  locator?: string;
  // Hotel fields  
  checkin?: string;
  checkout?: string;
  // Vehicle fields
  categoria?: string;
  periodo?: string;
  // Insurance fields
  cobertura?: string;
  // Transfer fields
  origem?: string;
  destino?: string;
  dataHora?: string;
  tipoVeiculo?: string;
  // Tour fields
  local?: string;
  dataPasseio?: string;
  duracao?: string;
  numeroPessoas?: string;
}

export function useCSVImport() {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

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

  // Map CSV row to sale data using column mapping
  const mapRowToSale = (row: any, mapping: Record<string, string | null>): SaleData => {
    const getValue = (field: string) => {
      const csvColumn = mapping[field];
      return csvColumn ? (row[csvColumn] || '').toString().trim() : '';
    };

    const getNumericValue = (field: string) => {
      const value = getValue(field);
      return value ? parseNumber(value) : 0;
    };

    const getDateValue = (field: string) => {
      const value = getValue(field);
      return value ? parseDate(value) : null;
    };

    // Extract all mapped values
    const sale_date = getValue('sale_date');
    const client_name = getValue('client_name') || 'Cliente Importado';
    const total_amount = getNumericValue('total_amount');
    const payment_method = getValue('payment_method') || 'Não informado';
    const installments = getNumericValue('installments') || 1;
    const gross_profit = getNumericValue('gross_profit') || null;
    const phone = getValue('phone');
    const notes = getValue('notes');
    const supplier = getValue('supplier');

    // Product data
    const product_type = getValue('product_type') || 'outros';
    const quantity = getNumericValue('quantity') || 1;
    const price = getNumericValue('price') || total_amount;
    const cost = getNumericValue('cost');
    const details = getValue('details');

    // Flight data
    const ticket_type = getValue('ticket_type');
    const airline = getValue('airline');
    const adults = getNumericValue('adults');
    const children = getNumericValue('children');
    const origin = getValue('origin');
    const destination = getValue('destination');
    const departure_date = getDateValue('departure_date');
    const return_date = getDateValue('return_date');
    const tax_value = getNumericValue('tax_value');
    const card_taxes = getValue('card_taxes');
    const miles_qty = getNumericValue('miles_qty');
    const miles_cost_per_thousand = getNumericValue('miles_cost_per_thousand');
    const locator = getValue('locator');

    // Hotel data
    const checkin_date = getDateValue('checkin_date');
    const checkout_date = getDateValue('checkout_date');

    // Vehicle data
    const vehicle_category = getValue('vehicle_category');
    const rental_period = getValue('rental_period');

    // Insurance data
    const coverage_type = getValue('coverage_type');

    // Transfer data
    const transfer_origin = getValue('transfer_origin');
    const transfer_destination = getValue('transfer_destination');
    const transfer_datetime = getValue('transfer_datetime');
    const vehicle_type = getValue('vehicle_type');

    // Tour data
    const tour_location = getValue('tour_location');
    const tour_date = getDateValue('tour_date');
    const tour_duration = getValue('tour_duration');
    const tour_people_count = getNumericValue('tour_people_count');

    // Build product based on detected type
    const product: ProductData = {
      type: product_type,
      name: details || `${airline || ''} ${origin || ''}-${destination || ''}`.trim() || 'Produto Importado',
      quantity: quantity,
      price: price,
      cost: cost,
      details: details
    };

    // Add type-specific fields
    if (product_type === 'passagem' || airline || origin || destination) {
      product.ticketType = ticket_type === 'tarifada' ? 'tarifada' : 'milhas';
      product.airline = airline;
      product.adults = adults || 1;
      product.children = children || 0;
      product.origin = origin;
      product.destination = destination;
      product.trecho1 = departure_date;
      product.trecho2 = return_date;
      product.taxValue = tax_value;
      product.cardTaxes = card_taxes;
      product.qtdMilhas = miles_qty;
      product.custoMil = miles_cost_per_thousand;
      product.locator = locator;
    } else if (product_type === 'hotel' || checkin_date || checkout_date) {
      product.checkin = checkin_date;
      product.checkout = checkout_date;
    } else if (product_type === 'veiculo' || vehicle_category) {
      product.categoria = vehicle_category;
      product.periodo = rental_period;
    } else if (product_type === 'seguro' || coverage_type) {
      product.cobertura = coverage_type;
    } else if (product_type === 'transfer' || transfer_origin) {
      product.origem = transfer_origin;
      product.destino = transfer_destination;
      product.dataHora = transfer_datetime;
      product.tipoVeiculo = vehicle_type;
    } else if (product_type === 'passeios' || tour_location) {
      product.local = tour_location;
      product.dataPasseio = tour_date;
      product.duracao = tour_duration;
      product.numeroPessoas = tour_people_count?.toString();
    }

    return {
      sale_date: sale_date ? parseDate(sale_date) || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      client_name: client_name,
      total_amount: total_amount,
      payment_method: normalizePaymentMethod(payment_method),
      installments: installments,
      gross_profit: gross_profit,
      notes: notes,
      phone: phone,
      products: [product]
    };
  };

  // Preview CSV data without importing
  const previewCSV = async (file: File, customMapping?: Record<string, string | null>): Promise<PreviewData> => {
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

    // Create proper mapping: field -> csvColumn
    let finalMapping: Record<string, string | null> = {};
    
    if (customMapping) {
      // Use custom mapping directly
      finalMapping = customMapping;
    } else {
      // Create mapping from automatic header detection
      // Ensure each field maps to only ONE column (prevent duplicates)
      const usedColumns = new Set<string>();
      
      headers.forEach((header) => {
        const field = mapHeaderToField(header);
        if (field && !finalMapping[field] && !usedColumns.has(header)) {
          finalMapping[field] = header;
          usedColumns.add(header);
        }
      });
    }

    console.log('Detected headers:', detectedHeaders);
    console.log('Final mapping:', finalMapping);

    // Process sample rows using new mapping function
    const dataLines = lines.slice(headerIndex + 1);
    let totalRevenue = 0;
    let totalProfit = 0;
    const sampleRows: PreviewData['sampleRows'] = [];

    for (let i = 0; i < Math.min(5, dataLines.length); i++) {
      const columns = parseCSVLine(dataLines[i], delimiter);
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = columns[index] || '';
      });

      try {
        const saleData = mapRowToSale(row, finalMapping);
        if (saleData.client_name && saleData.total_amount) {
          sampleRows.push({
            client_name: saleData.client_name,
            revenue: saleData.total_amount,
            profit: saleData.gross_profit || 0,
            payment_method: saleData.payment_method,
            status: 'Importado',
            sale_date: saleData.sale_date
          });
        }
      } catch (error) {
        console.warn('Error processing sample row:', error);
      }
    }

    // Calculate totals for all rows with deduplication
    const processedRows = new Set<string>();
    const duplicateKeys: string[] = [];
    let uniqueRowCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const columns = parseCSVLine(dataLines[i], delimiter);
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = columns[index] || '';
      });

      try {
        const saleData = mapRowToSale(row, finalMapping);
        
        // Skip rows with zero amount (headers, totals, empty lines)
        if (saleData.total_amount <= 0) continue;
        
        // Create deduplication key using client_name, sale_date, and total_amount
        const dedupeKey = `${saleData.sale_date}|${saleData.client_name}|${saleData.total_amount}`;
        
        if (processedRows.has(dedupeKey)) {
          duplicateKeys.push(dedupeKey);
          continue; // Skip duplicate row
        }
        
        processedRows.add(dedupeKey);
        uniqueRowCount++;
        totalRevenue += saleData.total_amount;
        totalProfit += saleData.gross_profit || 0;
      } catch (error) {
        console.warn('Error processing row for totals:', error);
      }
    }

    const duplicatesDetected = duplicateKeys.length;
    
    // Log diagnostics
    console.log(`Preview: ${dataLines.length} total rows, ${uniqueRowCount} unique rows, ${duplicatesDetected} duplicates detected`);
    if (duplicatesDetected > 0 && duplicateKeys.length > 0) {
      console.log('Sample duplicate keys:', duplicateKeys.slice(0, 3));
    }

    return {
      totalRevenue,
      totalProfit,
      sampleRows,
      detectedHeaders,
      rowCount: dataLines.length,
      uniqueRowCount,
      duplicatesDetected
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
    mutationFn: async ({ file, customMapping }: { file: File; customMapping?: Record<string, string | null> }): Promise<ImportResult> => {
      const text = await file.text();
      const { lines, originalLineNumbers, delimiterHint } = preprocessCSVContent(text);

      if (lines.length < 2) {
        throw new Error('Arquivo CSV deve ter pelo menos cabeçalho e uma linha de dados');
      }

      // Detect delimiter and header row, then create column mapping
      const delimiter = detectDelimiter(lines, delimiterHint);
      const headerIndex = findHeaderIndex(lines, delimiter);
      const headers = parseCSVLine(lines[headerIndex], delimiter);
      
      console.log('Detected delimiter:', delimiter, 'headerIndex:', headerIndex);

      const dataLines = lines.slice(headerIndex + 1);
      const dataLineNumbers = originalLineNumbers.slice(headerIndex + 1);
      const result: ImportResult = { success: 0, errors: [], suppliers: 0 };
      const createdSuppliers = new Set<string>();
      
      // Deduplication for import
      const processedImportRows = new Set<string>();
      let importDuplicates = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const rowNumber = (dataLineNumbers[i] ?? headerIndex + 1 + i) + 1;
        try {
          setProgress(Math.round((i / dataLines.length) * 100));

          const columns = parseCSVLine(dataLines[i], delimiter);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = columns[index] || '';
          });

          // Use the new mapping function
          const saleData = mapRowToSale(row, customMapping || {});

          // Basic validations
          if (!saleData.client_name || saleData.total_amount <= 0) {
            result.errors.push(`Linha ${rowNumber}: Dados obrigatórios faltando (Cliente ou Valor)`);
            continue;
          }
          
          // Check for duplicate during import
          const importKey = `${saleData.sale_date}|${saleData.client_name}|${saleData.total_amount}`;
          if (processedImportRows.has(importKey)) {
            importDuplicates++;
            continue; // Skip duplicate row during import
          }
          processedImportRows.add(importKey);

          // Create or get supplier if provided
          let supplierId: string | null = null;
          const supplierName = saleData.products[0]?.airline || '';
          if (supplierName && supplierName.trim() !== '') {
            supplierId = await createOrGetSupplier(supplierName, supplierName);
            if (supplierId && !createdSuppliers.has(supplierName)) {
              createdSuppliers.add(supplierName);
              result.suppliers++;
            }
          }

          // Insert sale using useSales hook structure
          const saleInput = {
            client_name: saleData.client_name,
            sale_date: saleData.sale_date,
            products: saleData.products,
            payment_method: saleData.payment_method,
            installments: saleData.installments || 1,
            total_amount: saleData.total_amount,
            gross_profit: saleData.gross_profit,
            supplier_id: supplierId,
            notes: saleData.notes
          };

          // Insert sale
          const { data: sale, error: saleError } = await supabase
            .from("sales")
            .insert([{
              client_name: saleInput.client_name,
              payment_method: saleInput.payment_method,
              installments: saleInput.installments,
              total_amount: saleInput.total_amount,
              sale_date: saleInput.sale_date,
              supplier_id: saleInput.supplier_id,
              gross_profit: saleInput.gross_profit,
              notes: saleInput.notes
            }])
            .select()
            .single();

          if (saleError) {
            result.errors.push(`Linha ${rowNumber}: Erro ao criar venda - ${saleError.message}`);
            continue;
          }

          // Insert products - map the form fields to database fields
          const productsForDb = saleInput.products.map(product => ({
            sale_id: sale.id,
            type: product.type || 'outros',
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            cost: product.cost || 0,
            details: product.details || '',
            // Map form fields to database fields
            airline: product.airline,
            passengers: product.adults && product.children ? `${product.adults} adultos, ${product.children} crianças` : '',
            origin: product.origin,
            destination: product.destination,
            // Convert empty strings to null for date fields
            departure_date: product.trecho1 || null,
            return_date: product.trecho2 || null,
            miles: product.qtdMilhas,
            miles_cost: product.custoMil,
            checkin_date: product.checkin || null,
            checkout_date: product.checkout || null,
            vehicle_category: product.categoria,
            rental_period: product.periodo,
            coverage_type: product.cobertura
          }));

          const { error: productsError } = await supabase
            .from("sale_products")
            .insert(productsForDb);

          if (productsError) {
            result.errors.push(`Linha ${rowNumber}: Erro ao criar produto - ${productsError.message}`);
            continue;
          }

          // Insert sale installments
          if (saleInput.installments >= 1) {
            const baseDate = saleInput.sale_date ? new Date(saleInput.sale_date) : new Date();
            const installmentAmount = saleInput.total_amount / saleInput.installments;
            
            const installmentsToInsert = Array.from({ length: saleInput.installments }, (_, index) => {
              const dueDate = new Date(baseDate);
              dueDate.setMonth(dueDate.getMonth() + index);
              
              return {
                sale_id: sale.id,
                installment_number: index + 1,
                due_date: dueDate.toISOString().split('T')[0],
                amount: installmentAmount,
                status: 'pending'
              };
            });

            const { error: installmentsError } = await supabase
              .from("sale_installments")
              .insert(installmentsToInsert);

            if (installmentsError) {
              console.warn(`Erro ao criar parcelas para venda ${sale.id}:`, installmentsError);
            }
          }

          result.success++;
        } catch (error) {
          result.errors.push(`Linha ${rowNumber}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      setProgress(100);
      
      // Log import duplicates
      if (importDuplicates > 0) {
        console.log(`Import: ${importDuplicates} linhas duplicadas foram ignoradas`);
        result.errors.push(`${importDuplicates} linhas duplicadas foram automaticamente ignoradas durante a importação`);
      }
      
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
    importCSV: (file: File, customMapping?: Record<string, string | null>) => 
      importCSVMutation.mutateAsync({ file, customMapping }),
    isLoading: importCSVMutation.isPending,
    progress,
    previewCSV,
    clearImports
  };
}