export interface HistorialCertificado {
  fecha: string;
  cedula: number;
  nombre: string;
  tipo_certificado: string;
  programa: string;
  libro: number;
  folio: number;
}

export const obtenerHistorial = async (): Promise<HistorialCertificado[]> => {
  const response = await fetch(
    "https://webhook.agentecrb.com/webhook/historial-cert",
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el historial");
  }

  const data = await response.json();

  // 🔒 blindaje absoluto
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;

  console.error("Respuesta inesperada de n8n:", data);
  return [];
};