
import { usePDF } from 'react-to-pdf';

export const generatePDF = async (element: HTMLElement) => {
  try {
    const { toPDF } = usePDF();
    await toPDF(element);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
};

