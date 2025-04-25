
import { generatePDF as reactToPdf } from 'react-to-pdf';

export const generatePDF = async (element: HTMLElement) => {
  try {
    await reactToPdf(element, {
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
