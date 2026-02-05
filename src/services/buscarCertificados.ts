import { SearchFormData } from "@/components/SearchCertificates";

export interface CertificadoResultado {
  id: string;
  nombre: string
  url: string;
}


export const buscarCertificados = async (
  payload: SearchFormData
): Promise<CertificadoResultado[]> => {
  const response = await fetch(
    "https://webhook.agentecrb.com/webhook/buscar",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudieron buscar los certificados");
  }

  const data = await response.json();
  console.log("📦 Respuesta cruda n8n:", data);
  // 🔥 NORMALIZACIÓN CLAVE
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === "object") {
      return [data]; // ← lo envuelves en array
    }

    return [];
};
