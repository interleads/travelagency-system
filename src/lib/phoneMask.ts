/**
 * Formata um número de telefone brasileiro no formato (XX) 9XXXX-XXXX
 * @param value - O valor do input de telefone
 * @returns Número formatado
 */
export function formatPhoneNumber(value: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Se não há números, retorna string vazia
  if (!cleaned) return '';
  
  // Aplica a máscara baseada no tamanho
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 3) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)}${cleaned.slice(3)}`;
  } else if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)}${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)}${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
}

/**
 * Remove a formatação do telefone, retornando apenas os números
 * @param value - Telefone formatado
 * @returns Apenas os números
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Hook para gerenciar input de telefone com máscara
 * @param initialValue - Valor inicial do telefone
 * @returns Objeto com valor formatado, valor limpo e handler de mudança
 */
import { useState } from 'react';

export function usePhoneInput(initialValue: string = '') {
  const [displayValue, setDisplayValue] = useState(formatPhoneNumber(initialValue));
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatPhoneNumber(e.target.value);
    setDisplayValue(newValue);
  };
  
  const rawValue = unformatPhoneNumber(displayValue);
  
  return {
    displayValue,
    rawValue,
    handleChange,
    setDisplayValue: (value: string) => setDisplayValue(formatPhoneNumber(value))
  };
}