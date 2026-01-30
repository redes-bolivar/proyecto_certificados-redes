import { CertificateData } from "@/components/CertificateForm";
export interface FolioResponse {
  libro: string;
  folio: number;
}

export const obtenerFolio = async (
  tipoCertificado: CertificateData["tipoCertificado"]
): Promise<FolioResponse> => {
  const response = await fetch(
    "https://webhook.agentecrb.com/webhook/folio/obtener",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo_certificado:
          tipoCertificado === "PROGRAMAS_TECNICO_LABORALES"
            ? "PROGRAMAS_TECNICO_LABORALES"
            : tipoCertificado === "CURSOS_CICLICOS"
            ? "CURSOS_CICLICOS"
            : tipoCertificado === "DIPLOMADOS"
            ? "DIPLOMADOS"
            : "CURSOS_EMPRESARIALES",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el folio");
  }

  return response.json();
};