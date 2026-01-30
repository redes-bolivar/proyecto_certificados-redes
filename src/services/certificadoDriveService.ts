import { CertificateData } from "@/components/CertificateForm";
import { loadSvgTemplate } from "@/utils/loadSvg";
import { replacePlaceholders } from "@/utils/replacePlaceholders";
import { svgStringToPdfBase64 } from "@/utils/svgStringToPdfBase64"; // <-- Importamos la nueva función
import { base64ToBlob } from "@/utils/base64ToBlob";
const SVG_PATHS = {
  CURSOS_CICLICOS: "/CURSOS_FINAL_FIN.svg",
  PROGRAMAS_TECNICO_LABORALES: "/PROGRAMAS_FINAL.svg",
  DIPLOMADOS: "/DIPLOMADOS_FINAL.svg",
  CURSOS_EMPRESARIALES: "/CURSOS_FINAL_FIN.svg"
};


export const guardarCertificadoEnDrive = async (
  data: CertificateData
) => {
  // 1️⃣ Cargar SVG
  const svgPath = SVG_PATHS[data.tipoCertificado];
  const rawSvg = await loadSvgTemplate(svgPath);

  // 2️⃣ Reemplazar placeholders
  const finalSvg = replacePlaceholders(rawSvg, data);

  // 3️⃣ Generar PDF en Base64 directamente
  const pdfBase64 = await svgStringToPdfBase64(finalSvg);

  const pdfBlob = base64ToBlob(pdfBase64);

const formData = new FormData();
formData.append("file0", pdfBlob, "certificado.pdf");
formData.append("data", JSON.stringify(data));

const response = await fetch(
  "https://webhook.agentecrb.com/webhook/certificado/guardar",
  {
    method: "POST",
    body: formData,
  }
);

if (!response.ok) {
  const text = await response.text();
  throw new Error(`Error n8n: ${text}`);
}

return {
  response: await response.json(),
  pdfBlob
};};
