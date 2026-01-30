export interface RespuestaAnulacion {
  success: boolean;
  message?: string;
}

export const anularCertificado = async (
  cedula: number
): Promise<RespuestaAnulacion> => {
  const response = await fetch(
    "https://webhook.agentecrb.com/webhook/anular-certificados",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cedula }),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo anular el certificado");
  }

  const data = await response.json();

  // Blindaje básico
  if (typeof data?.success === "boolean") {
    return data;
  }

  console.error("Respuesta inesperada de n8n:", data);
  return { success: false };
};