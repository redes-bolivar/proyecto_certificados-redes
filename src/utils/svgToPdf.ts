import { jsPDF } from "jspdf";

export const svgStringToPdf = async (
  svgContent: string,
  fileName: string
) => {

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

  const width = 3508;  // 297mm @ 300dpi
  const height = 2480; // 210mm @ 300dpi

  canvas.width = width;
  canvas.height = height;

  if (!ctx) throw new Error("No se pudo crear el canvas");

  // Fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Dibujar SVG sin deformar
  ctx.drawImage(img, 0, 0, width, height);

  // 4️⃣ PNG
  const pngData = canvas.toDataURL("image/png");

  // 5️⃣ PDF A4 HORIZONTAL
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  pdf.addImage(pngData, "PNG", 0, 0, 297, 210);
  pdf.save(fileName);

  URL.revokeObjectURL(svgUrl);
};
