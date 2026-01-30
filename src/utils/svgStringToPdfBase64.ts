import { jsPDF } from "jspdf";

export const svgStringToPdfBase64 = async (svgContent: string): Promise<string> => {
  // 1️⃣ Blob SVG
  const svgBlob = new Blob([svgContent], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  // 2️⃣ Cargar SVG como imagen
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = svgUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject("Error cargando SVG");
  });

  // 3️⃣ Canvas A4 HORIZONTAL @ 300 DPI
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 1754;  // 297mm @ 300dpi
  const height = 1240; // 210mm @ 300dpi

  canvas.width = width;
  canvas.height = height;

  if (!ctx) throw new Error("No se pudo crear el canvas");

  // Fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Dibujar SVG sin deformar
  ctx.drawImage(img, 0, 0, width, height);

  // 4️⃣ PNG
const jpgData = canvas.toDataURL("image/jpeg", 0.85);
  // 5️⃣ PDF A4 HORIZONTAL
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

pdf.addImage(jpgData, "JPEG", 0, 0, 297, 210);

  // 6️⃣ Exportar PDF como base64
  const base64 = pdf.output("datauristring").split(",")[1];

  URL.revokeObjectURL(svgUrl);

  return base64;
};