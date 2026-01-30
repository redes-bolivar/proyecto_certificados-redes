import { CertificateData } from "@/components/CertificateForm";


export const disminuirFolio = async (
  tipoCertificado: CertificateData["tipoCertificado"]
) => {
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
            : "CURSOS_CICLICOS",
        folio_exist: "exist"
      }),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el folio");
  }

  return response.json();
};