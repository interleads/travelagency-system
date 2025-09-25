import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useCallback } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Parsear moeda formatada para número com melhor precisão
export const parseCurrency = (value: string): number => {
  // Remove todos os caracteres exceto números, vírgula e ponto
  let cleanValue = value.replace(/[^\d,.-]/g, '');
  
  // Se não tem vírgula nem ponto, é um número inteiro
  if (!cleanValue.includes(',') && !cleanValue.includes('.')) {
    return parseFloat(cleanValue) || 0;
  }
  
  // Se tem vírgula, substitui por ponto (formato brasileiro)
  if (cleanValue.includes(',')) {
    // Se tem tanto vírgula quanto ponto, remove pontos (separadores de milhares)
    if (cleanValue.includes('.') && cleanValue.includes(',')) {
      cleanValue = cleanValue.replace(/\./g, '');
    }
    cleanValue = cleanValue.replace(',', '.');
  }
  
  const result = parseFloat(cleanValue) || 0;
  return result;
};

// Formatação de quantidade com separador de milhares
export const formatQuantity = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Parsear quantidade formatada para número
export const parseQuantity = (value: string): number => {
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue) || 0;
};

// Hook para campos de moeda com formatação automática
export const useCurrencyInput = (initialValue: number = 0) => {
  const [displayValue, setDisplayValue] = useState(() => 
    initialValue > 0 ? formatCurrency(initialValue) : ''
  );
  const [numericValue, setNumericValue] = useState(initialValue);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Remove formatação e converte para número
    const parsed = parseCurrency(inputValue);
    setNumericValue(parsed);
    
    // Manter o valor digitado pelo usuário sem reformatar automaticamente
    setDisplayValue(inputValue);
  }, []);

  const handleBlur = useCallback(() => {
    setDisplayValue(numericValue > 0 ? formatCurrency(numericValue) : '');
  }, [numericValue]);

  const setValue = useCallback((value: number) => {
    setNumericValue(value);
    setDisplayValue(value > 0 ? formatCurrency(value) : '');
  }, []);

  return {
    displayValue,
    numericValue,
    handleChange,
    handleBlur,
    setValue,
  };
};

// Hook para campos de quantidade com formatação automática
export const useQuantityInput = (initialValue: number = 0) => {
  const [displayValue, setDisplayValue] = useState(() => 
    initialValue > 0 ? formatQuantity(initialValue) : ''
  );
  const [numericValue, setNumericValue] = useState(initialValue);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Remove formatação e converte para número
    const parsed = parseQuantity(inputValue);
    setNumericValue(parsed);
    
    // Formatar apenas se há valor
    if (inputValue && parsed > 0) {
      setDisplayValue(formatQuantity(parsed));
    } else {
      setDisplayValue(inputValue);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setDisplayValue(numericValue > 0 ? formatQuantity(numericValue) : '');
  }, [numericValue]);

  const setValue = useCallback((value: number) => {
    setNumericValue(value);
    setDisplayValue(value > 0 ? formatQuantity(value) : '');
  }, []);

  return {
    displayValue,
    numericValue,
    handleChange,
    handleBlur,
    setValue,
  };
};
