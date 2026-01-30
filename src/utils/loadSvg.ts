export const loadSvgTemplate = async (path: string): Promise<string> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error("No se pudo cargar el SVG");
  }
  return await response.text();
};
