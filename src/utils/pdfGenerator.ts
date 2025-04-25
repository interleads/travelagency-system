
import { usePDF } from 'react-to-pdf';

export const generatePDF = async (element: HTMLElement) => {
  try {
    // The correct way to use react-to-pdf is through the usePDF hook
    // But since we're using it in a regular function, we'll use the direct toPDF function
    const { toPDF } = usePDF();
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
