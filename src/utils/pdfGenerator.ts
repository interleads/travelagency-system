
import { toPDF } from 'react-to-pdf';

export const generatePDF = async (element: HTMLElement) => {
  try {
    await toPDF(element, {
      filename: 'travel-package.pdf',
      page: {
        margin: 10,
        format: 'a4'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
};
