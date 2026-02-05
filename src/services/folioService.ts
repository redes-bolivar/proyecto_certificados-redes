import { CertificateData } from "@/components/CertificateForm";
export interface FolioResponse {
  libro: string;
  folio: number;
}

export const obtenerFolio = async (
  tipoCertificado: string
): Promise<FolioResponse> => {
  const response = await fetch(
    "https://webhook.agentecrb.com/webhook/folio/obtener",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipo_certificado: tipoCertificado, // 👈 directo, sin ifs
      }),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el folio");
  }

  return response.json();
};