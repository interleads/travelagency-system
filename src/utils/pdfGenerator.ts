
import { usePDF } from 'react-to-pdf';

export const generatePDF = async (element: HTMLElement) => {
  try {
    const { toPDF } = usePDF();
    await toPDF(element, {
      filename: 'pacote-viagem.pdf',
      page: {
        margin: 20,
        format: 'a4',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
};
