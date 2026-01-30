import { CertificateData } from "@/components/CertificateForm";
import { loadSvgTemplate } from "./loadSvg";
import { replacePlaceholders } from "./replacePlaceholders";
import { svgStringToPdf } from "./svgToPdf";

const SVG_PATHS = {
  CURSOS_CICLICOS: "/CURSOS_FINAL.svg",
  PROGRAMAS_TECNICO_LABORALES: "/PROGRAMAS_FINAL.svg",
  CURSOS_EMPRESARIALES: "/CURSOS_FINAL.svg",
  DIPLOMADOS: "/CURSOS_DIPLO_FINAL.svg"
};

export const downloadCertificate = async (data: CertificateData) => {
  const svgPath = SVG_PATHS[data.tipoCertificado];

  const rawSvg = await loadSvgTemplate(svgPath);
  const finalSvg = replacePlaceholders(rawSvg, data);

  const fileName = `Certificado_${data.nombreCompleto.replace(
    /\s+/g,
    "_"
  )}.pdf`;
  
  await svgStringToPdf(finalSvg, fileName);
};

export const downloadMultipleCertificates = async (
  dataArray: CertificateData[]
) => {
  for (let i = 0; i < dataArray.length; i++) {
    await downloadCertificate(dataArray[i]);
    await new Promise((r) => setTimeout(r, 400));
  }
};
