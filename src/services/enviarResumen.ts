export interface ResumenCargaMasiva {
  total: number;
  exitosos: number;
  fallidos: number;
  duracion: string;
  fecha: string;
}

export const enviarResumen = async (
  resumen: ResumenCargaMasiva
) => {
  const response = await fetch(
    "https://webhook.agentecrb.com/webhook/resumen-masivo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumen),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error enviando resumen: ${text}`);
  }

  return response.json();
};