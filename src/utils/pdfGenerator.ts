import { jsPDF } from "jspdf";
import { CertificateData } from "@/components/CertificateForm";

export const generateCertificatePDF = (data: CertificateData) => {
  // Create PDF in A4 size (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;

  // Get current date
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Add decorative border
  pdf.setDrawColor(21, 68, 168); // Professional blue
  pdf.setLineWidth(1);
  pdf.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));
  
  pdf.setLineWidth(0.5);
  pdf.rect(margin - 3, margin - 3, pageWidth - 2 * (margin - 3), pageHeight - 2 * (margin - 3));

  // Title
  pdf.setFontSize(32);
  pdf.setFont("times", "bold");
  pdf.setTextColor(26, 26, 26);
  pdf.text("CERTIFICADO", pageWidth / 2, 50, { align: "center" });

  // Decorative line under title
  pdf.setDrawColor(21, 68, 168);
  pdf.setLineWidth(0.8);
  pdf.line(60, 55, pageWidth - 60, 55);

  // Body text
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(70, 70, 70);
  
  const bodyY = 80;
  pdf.text("La institución certifica que:", pageWidth / 2, bodyY, { align: "center" });

  // Student name (highlighted) - with automatic sizing
  pdf.setFont("times", "bold");
  pdf.setTextColor(21, 68, 168);
  
  // Calculate appropriate font size based on text length
  const nameText = data.nombreCompleto.toUpperCase();
  const maxWidth = pageWidth - 2 * margin - 20; // Safe margin area
  
  let fontSize = 24;
  pdf.setFontSize(fontSize);
  let textWidth = pdf.getTextWidth(nameText);
  
  // Reduce font size if text is too wide
  while (textWidth > maxWidth && fontSize > 12) {
    fontSize -= 2;
    pdf.setFontSize(fontSize);
    textWidth = pdf.getTextWidth(nameText);
  }
  
  // If still too wide, split into multiple lines
  if (textWidth > maxWidth) {
    const words = nameText.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      pdf.setFontSize(fontSize);
      const testWidth = pdf.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Draw multiple lines
    const lineHeight = fontSize * 0.4;
    const startY = bodyY + 20 - ((lines.length - 1) * lineHeight / 2);
    lines.forEach((line, index) => {
      pdf.text(line, pageWidth / 2, startY + (index * lineHeight), { align: "center" });
    });
  } else {
    pdf.text(nameText, pageWidth / 2, bodyY + 20, { align: "center" });
  }

  // Additional details
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(70, 70, 70);
  
  const detailsY = bodyY + 40;
  pdf.text("Ha completado satisfactoriamente el programa académico", pageWidth / 2, detailsY, { align: "center" });
  pdf.text("establecido por esta institución.", pageWidth / 2, detailsY + 7, { align: "center" });

  // Document information box
  const boxY = detailsY + 30;
  pdf.setFillColor(240, 244, 248);
  pdf.roundedRect(margin + 10, boxY, pageWidth - 2 * (margin + 10), 45, 3, 3, "F");

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(26, 26, 26);
  
  const infoX = margin + 20;
  let infoY = boxY + 10;
  const maxInfoWidth = pageWidth - 2 * (margin + 20) - 65; // Width available for values
  
  // Helper function to truncate text if too long
  const fitText = (text: string, maxWidth: number, fontSize: number): string => {
    pdf.setFontSize(fontSize);
    let fitText = text;
    let textWidth = pdf.getTextWidth(fitText);
    
    while (textWidth > maxWidth && fitText.length > 0) {
      fitText = fitText.slice(0, -1);
      textWidth = pdf.getTextWidth(fitText + "...");
    }
    
    return textWidth > maxWidth ? fitText + "..." : text;
  };
  
  pdf.text("Número de Documento:", infoX, infoY);
  pdf.setFont("helvetica", "normal");
  pdf.text(fitText(data.cedula, maxInfoWidth, 11), infoX + 60, infoY);

  infoY += 10;
  pdf.setFont("helvetica", "bold");
  pdf.text("Lugar de Expedición:", infoX, infoY);
  pdf.setFont("helvetica", "normal");
  pdf.text(fitText(data.lugarExpedicion, maxInfoWidth, 11), infoX + 60, infoY);



  infoY += 10;
  pdf.setFont("helvetica", "bold");
  pdf.text("Fecha de Expedición:", infoX, infoY);
  pdf.setFont("helvetica", "normal");
  pdf.text(currentDate, infoX + 60, infoY);

  // Signature line
  const signatureY = pageHeight - 60;
  pdf.setDrawColor(70, 70, 70);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, signatureY, pageWidth / 2 + 40, signatureY);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(70, 70, 70);
  pdf.text("Firma Autorizada", pageWidth / 2, signatureY + 7, { align: "center" });
  pdf.text("Director Académico", pageWidth / 2, signatureY + 13, { align: "center" });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text(
    "Este certificado es un documento oficial emitido por la institución educativa",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" }
  );

  return pdf;
};

export const downloadCertificate = (data: CertificateData) => {
  const pdf = generateCertificatePDF(data);
  const fileName = `Certificado_${data.nombreCompleto.replace(/\s+/g, "_")}.pdf`;
  pdf.save(fileName);
};

export const downloadMultipleCertificates = (dataArray: CertificateData[]) => {
  dataArray.forEach((data, index) => {
    setTimeout(() => {
      downloadCertificate(data);
    }, index * 500); // Delay to avoid browser blocking multiple downloads
  });
};
